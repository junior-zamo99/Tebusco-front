import {
  Injectable,
  ApplicationRef,
  EnvironmentInjector,
  createComponent,
  ComponentRef,
  EmbeddedViewRef,
  Type
} from '@angular/core';
import { CreateAddressDialog } from '../components/create-address-dialog/create-address-dialog'; // Ajusta la ruta
import { AddressDialogComponent } from '../components/addres-dialog/addres-dialog';

@Injectable({
  providedIn: 'root'
})
export class AddressDialogService {
  // Guardamos la referencia del componente actual para poder cerrarlo
  private dialogRef: ComponentRef<any> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}


  open(): Promise<boolean> {
    return this.openGenericDialog(AddressDialogComponent);
  }


  openCreateLocation(): Promise<boolean> {
    return this.openGenericDialog(CreateAddressDialog);
  }


  private openGenericDialog(component: Type<any>): Promise<boolean> {
    if (this.dialogRef) {
      this.closeDialog();
    }

    this.dialogRef = createComponent(component, {
      environmentInjector: this.injector
    });

    this.appRef.attachView(this.dialogRef.hostView);

    const domElem = (this.dialogRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    return new Promise((resolve) => {
      const sub = this.dialogRef!.instance.close.subscribe((result: boolean) => {

        this.closeDialog();
        sub.unsubscribe();

        resolve(result);
      });
    });
  }


  private closeDialog() {
    if (this.dialogRef) {
      this.appRef.detachView(this.dialogRef.hostView);
      this.dialogRef.destroy();
      this.dialogRef = null;
    }
  }
}
