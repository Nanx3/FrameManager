import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Rxjs
import { retryWhen, tap, delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Services
import { WebsocketService } from '../services/websocket.service';
import { DataFormatService } from '../services/data-format.service';

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.scss']
})
export class FaceComponent implements OnInit {
  faces: Array<any> = [];
  private socketSubscription: Subscription;
  constructor(
    private websocketService: WebsocketService,
    private dataFormatService: DataFormatService,
    private sanitizer : DomSanitizer) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    const delayTime = 3000;
    this.socketSubscription  = this.websocketService.getData$(`ws://127.0.0.1:3012/face`)
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
        let face = {
          id: this.faces.length + 1,
          date: this.dataFormatService.dateFormat(Date.now()),
          time: this.dataFormatService.timeFormat(Date.now()),
          src: this.sanitizer.bypassSecurityTrustUrl(objectURL)
        };
        this.faces.push(face);
      }, err => {
        console.log('No more data');
        console.error(err);
      });
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
  }
}
