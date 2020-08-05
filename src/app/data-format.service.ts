import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataFormatService {
  constructor() { }
  
  dateFormat(date) {
    if (!(date instanceof Date))
      date = new Date(date)
    var options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }
    return date.toLocaleDateString('es-ES', options)
  }

  timeFormat(time) {
    if (!(time instanceof Date))
      time = new Date(time)
    const options = {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    return time.toLocaleTimeString('es-ES', options)
  }
}
