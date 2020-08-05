import { Component, OnInit, Input } from '@angular/core';
import { retryWhen, tap, delay } from 'rxjs/operators';
import { WebsocketService } from './../websocket.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  frame: any;
  private socketSubscription: Subscription;

  constructor(private websocketService: WebsocketService, private sanitizer : DomSanitizer) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    const delayTime = 3000;
    this.websocketService.getData$(`ws://127.0.0.1:3012/video`)
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
        const frame = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.frame = frame;
      }, err => {
        console.log('No more data');
        console.error(err);
      });
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
  }

  toggle() {
    if (this.socketSubscription && !this.socketSubscription.closed) {
      return this.socketSubscription.unsubscribe();
    }
    this.init();
  }
}
