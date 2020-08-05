import { Component, OnInit, Input } from '@angular/core';
import { retryWhen, tap, delay } from 'rxjs/operators';
import { WebsocketService } from './../websocket.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.scss']
})
export class FaceComponent implements OnInit {
  faces: Array<any> = [];
  private socketSubscription: Subscription;
  constructor(private websocketService: WebsocketService, private sanitizer : DomSanitizer) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    const delayTime = 3000;
    this.websocketService.getData$(`ws://127.0.0.1:3012/face`)
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
        const face = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        if (!this.faces.includes(face)) {
          this.faces.push(face);
        }
      }, err => {
        console.log('No more data');
        console.error(err);
      });
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
  }
}
