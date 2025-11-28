import { Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CustomDialog } from '../components/custom-dialog/custom-dialog';
import { DialogConfig, DialogResult } from '../models/dialog.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogComponentRef: ComponentRef<CustomDialog> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  private openDialog(config: DialogConfig): Observable<DialogResult> {
    const subject = new Subject<DialogResult>();

    this.dialogComponentRef = createComponent(CustomDialog, {
      environmentInjector: this.injector
    });

    this.dialogComponentRef.instance.config = config;

    this.dialogComponentRef.instance.close.subscribe((result: DialogResult) => {
      subject.next(result);
      subject.complete();
      this.closeDialog();
    });

    this.appRef.attachView(this.dialogComponentRef.hostView);
    const domElem = (this.dialogComponentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    document.body.style.overflow = 'hidden';

    return subject.asObservable();
  }

  private closeDialog(): void {
    if (this.dialogComponentRef) {
      this.appRef.detachView(this.dialogComponentRef.hostView);
      this.dialogComponentRef.destroy();
      this.dialogComponentRef = null;

      document.body.style.overflow = '';
    }
  }


  success(title: string, message: string): Observable<DialogResult> {
    return this.openDialog({
      type: 'success',
      title,
      message,
      confirmText: 'Entendido',
      showCancel: false
    });
  }


  error(title: string, message: string): Observable<DialogResult> {
    return this.openDialog({
      type: 'error',
      title,
      message,
      confirmText: 'Cerrar',
      showCancel: false
    });
  }


  warning(title: string, message: string): Observable<DialogResult> {
    return this.openDialog({
      type: 'warning',
      title,
      message,
      confirmText: 'Entendido',
      showCancel: false
    });
  }


  info(title: string, message: string): Observable<DialogResult> {
    return this.openDialog({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
      showCancel: false
    });
  }

  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Observable<DialogResult> {
    return this.openDialog({
      type: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true
    });
  }

  custom(config: DialogConfig): Observable<DialogResult> {
    return this.openDialog(config);
  }
}
