import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAddressService } from '../../services/user-address.service';
import { StorageService, StorageUserAddress } from '../../services/storage.service';
import { UserAddress } from '../../models/user-address.models';
import { AddressDialogService } from '../../services/address-dialog.service';

@Component({
  selector: 'app-address-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addres-dialog.html',
  // No necesitamos styleUrls si usas Tailwind con las variables globales que me pasaste
})
export class AddressDialogComponent implements OnInit {
  @Output() close = new EventEmitter<boolean>();

  addresses: UserAddress[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private userAddressService: UserAddressService,
    private storageService: StorageService,
    private addressDialogService: AddressDialogService
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses() {
    const applicant = this.storageService.getApplicant();

    if (!applicant) {
      this.isLoading = false;
      this.errorMessage = 'No se encontró información del solicitante.';
      return;
    }

    this.userAddressService.getAddressByApplicant(applicant.id).subscribe({
      next: (response: any) => {
        // CORRECCIÓN AQUÍ: Accedemos a response.data
        // Tu backend devuelve: { success: true, data:Array, ... }
        if (response.data && Array.isArray(response.data)) {
           this.addresses = response.data;
        } else {
           // Fallback por si acaso el backend devuelve el array directo
           this.addresses = Array.isArray(response) ? response : [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar las direcciones.';
        this.isLoading = false;
      }
    });
  }

  selectAddress(address: UserAddress): void {
    const storageAddress: StorageUserAddress = {
      addressId: address.id,
      label: address.label,
      country: address.country,
      state: address.state ?? null,
      city: address.city,
      address: address.address ?? null,
      postalCode: address.postalCode ?? null,
      lat: address.lat ?? null,
      lng: address.lng ?? null,
      isDefault: address.isDefault,
      isActive: address.isActive
    };

    this.storageService.saveApplicantAddress(storageAddress);
    this.close.emit(true);
  }

  onCancel(): void {
    this.close.emit(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  async openNewAddress() {

    this.close.emit(false);

     setTimeout(async () => {
        const created = await this.addressDialogService.openCreateLocation();

        if (created) {

          this.storageService.saveMessageAddress('S');
          console.log('Nueva dirección creada y seleccionada.');

        } else {

          await this.addressDialogService.open();
        }
    }, 100);
  }
}
