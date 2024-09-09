import { Component } from '@angular/core';
import { ToastService } from '../../services/toastServices';
import { Injectable, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  isTemplate(toast: any) {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
