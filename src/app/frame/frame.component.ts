import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Rxjs
import { retryWhen, tap, delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Services
import { WebsocketService } from '../services/websocket.service';
import { DataFormatService } from '../services/data-format.service';
import { MatSnackBar } from '@angular/material/snack-bar';

//Enviroment
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  frame: any;
  ctrPlay: boolean = false;
  private socketSubscription: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private dataFormatService: DataFormatService,
    private sanitizer : DomSanitizer,
    private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    const delayTime = 3000;
    this.socketSubscription = this.websocketService.getData$(environment.video_url)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            tap(err => {
              console.error('Got error', err);
            }),
            delay(delayTime),
          )
        )
      )
      .subscribe(({data}) => {
        const objectURL = URL.createObjectURL(data);
        let frame = {
          id: 1,
          date: this.dataFormatService.dateFormat(Date.now()),
          time: this.dataFormatService.timeFormat(Date.now()),
          src: this.sanitizer.bypassSecurityTrustUrl(objectURL)
        };
        this.frame = frame;
      }, err => {
        console.log('No more data');
        console.error(err);
      });
  }

  toggle() {
    if (this.socketSubscription && !this.socketSubscription.closed) {
      this.ctrPlay = true;
      return this.socketSubscription.unsubscribe();
    }
    this.ctrPlay = false
    this.init();
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
