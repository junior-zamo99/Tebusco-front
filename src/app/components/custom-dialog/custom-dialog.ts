import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfig, DialogResult } from '../../models/dialog.model';


@Component({
  selector: 'app-custom-dialog',
  imports: [CommonModule],
  templateUrl: './custom-dialog.html',
  styleUrls: ['./custom-dialog.css'],
})
export class CustomDialog {
 @Input() config!: DialogConfig;
  @Output() close = new EventEmitter<DialogResult>();

  ngOnInit() {
    this.config.confirmText = this.config.confirmText || 'Aceptar';
    this.config.cancelText = this.config.cancelText || 'Cancelar';
    this.config.showCancel = this.config.showCancel ?? (this.config.type === 'confirm');
     this.config.imageAlt = this.config.imageAlt || 'Dialog image';
  }

  onConfirm(): void {
    const result: DialogResult = { confirmed: true, cancelled: false };
    this.close.emit(result);
  }

  onCancel(): void {
    const result: DialogResult = { confirmed: false, cancelled: true };
    this.close.emit(result);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getIcon(): string {
    if (this.config.icon) return this.config.icon;

    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      confirm: '?'
    };
    return icons[this.config.type] || 'ℹ';
  }

  getIconClass(): string {
    return `icon-${this.config.type}`;
  }
   hasImage(): boolean {
    return !!this.config.imageUrl;
  }

  getImageStyles(): any {
    const styles: any = {};
    if (this.config.imageHeight) {
      styles.height = this. config.imageHeight;
    }
    if (this.config. imageWidth) {
      styles. width = this.config.imageWidth;
    }
    return styles;
  }
}
