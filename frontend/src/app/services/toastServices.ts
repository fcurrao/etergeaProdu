import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}): void {
    const toast = { textOrTpl, ...options };
    this.toasts.push(toast);

    if (options.delay) {
      setTimeout(() => this.remove(toast), options.delay);
    }
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
