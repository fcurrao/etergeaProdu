import { Component, OnInit } from '@angular/core';
import {  APP_VERSION } from '../../../environments/version'; 
import * as esTranslations from '../../../assets/es.json'

@Component({ 
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
 version : string | undefined;
 public es: any = (esTranslations as any).default || esTranslations;

  constructor() { }

  ngOnInit() {
    this.version = APP_VERSION;
  }

}
