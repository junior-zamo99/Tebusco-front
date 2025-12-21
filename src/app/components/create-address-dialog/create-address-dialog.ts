import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAddressService } from '../../services/user-address.service';
import { StorageService, StorageUserAddress } from '../../services/storage.service'; // Importamos la interfaz
import { CreateLocationDTO, UserAddressTypeEnum } from '../../models/user-address.models';
import { LocationCoordinates, MapLocationPickerComponent } from '../map-location-picker/map-location-picker';


@Component({
  selector: 'app-create-address-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MapLocationPickerComponent],
  templateUrl: './create-address-dialog.html',
  styleUrl: './create-address-dialog.css',
})
export class CreateAddressDialog {
  @Output() close = new EventEmitter<boolean>();

  label: string = '';
  selectedCoords: LocationCoordinates | null = null;
  isSaving: boolean = false;

  constructor(
    private userAddressService: UserAddressService,
    private storageService: StorageService
  ) {}

  onLocationSelected(coords: LocationCoordinates) {
    this.selectedCoords = coords;
  }

  cancel() {
    this.close.emit(false);
  }

  saveLocation() {
    if (!this.selectedCoords || !this.label.trim()) return;

    const user = this.storageService.getUser();
    if (!user) return;

    this.isSaving = true;

    // 1. Preparamos el DTO para enviar al Backend
    const dto: CreateLocationDTO = {
      label: this.label,
      lat: this.selectedCoords.lat,
      lng: this.selectedCoords.lng,
      city: this.selectedCoords.address?.city || 'Santa Cruz de la Sierra',
      country: this.selectedCoords.address?.country || 'Bolivia',
      state: this.selectedCoords.address?.state || 'Santa Cruz',
      fullAddress: this.selectedCoords.address?.fullAddress || '',
      type: UserAddressTypeEnum.APPLICANT
    };

    this.userAddressService.createLocation(dto).subscribe({
      next: (response: any) => { // Usamos any o la interfaz de respuesta genérica

        // 2. Extraemos la data real del objeto "data" que envía tu backend
        // Backend responde: { success: true, message: '...', data: { ... } }
        const newAddress = response.data || response;

        // 3. Mapeamos EXACTAMENTE a la interfaz del Storage
        const storageAddress: StorageUserAddress = {
          addressId: newAddress.addressId, // ID que viene del backend (24 en tu ejemplo)
          label: newAddress.label,         // "gimnasio"
          country: newAddress.country,
          state: newAddress.state,
          city: newAddress.city,

          // Nota: Tu backend devuelve 'address' como null, pero 'fullAddress' tiene texto.
          // Guardamos fullAddress en el campo address del storage para que se vea algo.
          address: newAddress.fullAddress || newAddress.address,

          postalCode: newAddress.postalCode,

          // --- AQUÍ GUARDAMOS LAS COORDENADAS ---
          lat: newAddress.lat, // -17.815...
          lng: newAddress.lng, // -63.164...

          isDefault: newAddress.isDefault,
          isActive: newAddress.isActive
        };

        // 4. Guardamos en LocalStorage
        this.storageService.saveApplicantAddress(storageAddress);

        // 5. También actualizamos el flag 'S' para que no vuelva a pedir ubicación
        this.storageService.saveMessageAddress('S');

        console.log('Ubicación guardada en LocalStorage con coordenadas:', storageAddress);

        this.isSaving = false;
        this.close.emit(true);
      },
      error: (err) => {
        console.error('Error al guardar ubicación:', err);
        this.isSaving = false;
      }
    });
  }
}
