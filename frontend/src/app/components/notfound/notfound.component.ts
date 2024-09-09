import { Component, OnInit } from '@angular/core'; 
import * as esTranslations from '../../../assets/es.json'

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css']
})
export class NotfoundComponent implements OnInit { 
  public es: any = (esTranslations as any).default || esTranslations;

  constructor() { }

  ngOnInit() {
  }

}
