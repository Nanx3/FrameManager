import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  constructor() { }

  public getData$(url:string) {
    return new Observable(observer => {
      try {
        const dataSocket = webSocket({
          url: url,
          deserializer: msg => msg
        });
        dataSocket.subscribe((data) =>
          observer.next(data),
          (err) => observer.error(err),
          () => observer.complete()
        );
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
