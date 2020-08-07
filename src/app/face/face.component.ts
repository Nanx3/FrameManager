import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Rxjs
import { retryWhen, tap, delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Services
import { WebsocketService } from '../services/websocket.service';
import { DataFormatService } from '../services/data-format.service';

//Enviroment
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.scss']
})
export class FaceComponent implements OnInit {
  faces: Array<any> = [];
  locations = [
    'Barcelona',
    'Alicante',
    'Valencia',
    'Málaga',
    'Sevilla'
  ];
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
    this.socketSubscription  = this.websocketService.getData$(environment.face_url)
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
        let percentage = this.getPercentage(); 
        let face = {
          id: this.getId(),
          date: this.dataFormatService.dateFormat(Date.now()),
          time: this.dataFormatService.timeFormat(Date.now()),
          src: this.sanitizer.bypassSecurityTrustUrl(objectURL),
          location: this.getLocation(),
          percentage: percentage,
          color: this.getColor(percentage)
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

  getLocation() {
    return this.locations[Math.floor(Math.random() * this.locations.length)]; 
  }

  getPercentage() {
    return Math.floor((Math.random() * 99) + 1);
  }

  inRange(x, min, max) {
    return ((x - min) * ( x - max) <= 0);
  }

  getColor(percentage) {
    let color = '#ff3d71'
    if (this.inRange(percentage, 61, 100)) color = '#00d68f';
    if (this.inRange(percentage, 31, 60)) color = '#fa0'
    return color;
  }
  
  getId() {
    return Math.floor(Math.random() * (9000 - 1000) ) + 1000;
  }
}
