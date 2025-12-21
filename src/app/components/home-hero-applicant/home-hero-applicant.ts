import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService, StorageUserAddress } from '../../services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-hero-applicant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-hero-applicant.html',
})
export class HomeHeroApplicant implements OnInit, OnDestroy {
  @Input() userName: string = 'Usuario';
  @Output() createRequest = new EventEmitter<void>();
  @Output() openAddressModal = new EventEmitter<void>();

  currentAddress: StorageUserAddress | null = null;
  private sub: Subscription | null = null;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.sub = this.storageService.address$.subscribe(address => {
      this.currentAddress = address;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  getAddressLabel(): string {
    return this.currentAddress ? this.currentAddress.label : 'Seleccionar ubicación';
  }

  getFullAddress(): string {
    if (!this.currentAddress) return 'Configurar ahora';

    if (this.currentAddress.fullAddress) return this.currentAddress.fullAddress;
    if (this.currentAddress.address) return `${this.currentAddress.address}, ${this.currentAddress.city}`;

    return `${this.currentAddress.city}, ${this.currentAddress.country}`;
  }
}
