import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { ExtraPackage, SelectedExtra } from '../../services/extras.service';

export interface ExtraFeatureGroup {
  featureId: number;
  featureKey: string;
  displayName: string;
  isAccumulable: boolean;
  packages: ExtraPackage[];
}

@Component({
  selector: 'app-extras-selector',
  standalone: true,
  imports: [],
  templateUrl: './extras-selector.component.html',
  styleUrls: ['./extras-selector.component.css']
})
export class ExtrasSelectorComponent implements OnInit {
  @Input() packages: ExtraPackage[] = [];
  @Output() extrasSelected = new EventEmitter<SelectedExtra[]>();

  featureGroups: ExtraFeatureGroup[] = [];
  selectedExtras: Map<number, number> = new Map();
  activeTab: string = '';

  constructor(private cdr: ChangeDetectorRef) {}


  get activeGroup(): ExtraFeatureGroup | undefined {
    return this.featureGroups.find(g => g.featureKey === this.activeTab);
  }

  ngOnInit() {
    this.groupPackagesByFeature();
  }


  groupPackagesByFeature() {
    const grouped = new Map<number, ExtraFeatureGroup>();

    this.packages
      .filter(pkg => pkg.isActive)
      .forEach(pkg => {
        if (!grouped.has(pkg.featureId)) {
          grouped.set(pkg.featureId, {
            featureId: pkg.featureId,
            featureKey: pkg.feature.key,
            displayName: pkg.feature.displayName,
            isAccumulable: pkg.feature.isAccumulable,
            packages: []
          });
        }
        grouped.get(pkg.featureId)!.packages.push(pkg);
      });

    grouped.forEach(group => {
      group.packages.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    this.featureGroups = Array.from(grouped.values())
      .filter(group => group.packages.length > 0);

    if (this.featureGroups.length > 0 && !this.activeTab) {
      this.activeTab = this.featureGroups[0].featureKey;
    }

    console.log('📦 Grupos de extras creados:', this.featureGroups);
    console.log('📑 Pestaña activa:', this.activeTab);
  }


  setActiveTab(featureKey: string) {
    this.activeTab = featureKey;
    this.cdr.detectChanges();
  }


  getTabIconSVG(featureKey: string): string {
    const icons: { [key: string]: string } = {
      'offers': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
      </svg>`,
      'categories': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>`,
      'promocional': `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`,
      'extra_city': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>`,
      'national_visibility': `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.5 5 5.5 1-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-1z"/>
        <path d="M5 21h14v1H5z"/>
      </svg>`
    };
    return icons[featureKey] || `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }


  incrementQuantity(pkg: ExtraPackage) {
    if (!pkg.feature.isAccumulable) return;

    const current = this.selectedExtras.get(pkg.id) || 0;
    this.selectedExtras.set(pkg.id, current + 1);
    this.emitChanges();
  }


  decrementQuantity(pkg: ExtraPackage) {
    if (!pkg.feature.isAccumulable) return;

    const current = this.selectedExtras.get(pkg.id) || 0;
    if (current > 0) {
      this.selectedExtras.set(pkg.id, current - 1);
      this.emitChanges();
    }
  }


  toggleCheckbox(pkg: ExtraPackage) {
    const current = this.selectedExtras.get(pkg.id) || 0;

    if (!pkg.feature.isAccumulable) {
      this.selectedExtras.set(pkg.id, current === 1 ? 0 : 1);
    } else {
      this.selectedExtras.set(pkg.id, current > 0 ? 0 : 1);
    }

    this.emitChanges();
  }


  isPackageSelected(packageId: number): boolean {
    const qty = this.selectedExtras.get(packageId) || 0;
    return qty > 0;
  }


  getPackageQuantity(packageId: number): number {
    return this.selectedExtras.get(packageId) || 0;
  }


  emitChanges() {
    const selected: SelectedExtra[] = [];

    this.selectedExtras.forEach((quantity, packageId) => {
      if (quantity > 0) {
        const pkg = this.findPackageById(packageId);
        if (pkg) {
          selected.push({
            packageId: pkg.id,
            quantity: quantity,
            name: pkg.name,
            price: pkg.price,
            totalPrice: pkg.price * quantity
          });
        }
      }
    });

    console.log('✅ Extras seleccionados emitidos:', selected);
    this.extrasSelected.emit(selected);
    this.cdr.detectChanges();
  }


  private findPackageById(packageId: number): ExtraPackage | undefined {
    for (const group of this.featureGroups) {
      const pkg = group.packages.find(p => p.id === packageId);
      if (pkg) return pkg;
    }
    return undefined;
  }


  get totalExtrasPrice(): number {
    let total = 0;
    this.selectedExtras.forEach((qty, pkgId) => {
      const pkg = this.findPackageById(pkgId);
      if (pkg && qty > 0) {
        total += pkg.price * qty;
      }
    });
    return total;
  }


  get currency(): string {
    return this.packages.length > 0 ? this.packages[0].currency : 'BOB';
  }


  get hasSelectedExtras(): boolean {
    return this.totalExtrasPrice > 0;
  }


  getFeatureIcon(featureKey: string): string {
    const icons: { [key: string]: string } = {
      'offers': '📊',
      'categories': '🏷️',
      'promocional': '⭐',
      'extra_city': '📍',
      'national_visibility': '🌟'
    };
    return icons[featureKey] || '✨';
  }
}
