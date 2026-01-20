import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService, StorageUserAddress } from '../../services/storage.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-hero-applicant',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './home-hero-applicant.html',
})
export class HomeHeroApplicant implements OnInit, OnDestroy {
  @Input() userName: string = 'Usuario';
  @Output() createRequest = new EventEmitter<void>();
  @Output() openAddressModal = new EventEmitter<void>();

  currentAddress: StorageUserAddress | null = null;
  isSearchMode: boolean = false;
  searchQuery: string = '';
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


  activateSearch() {
    this.isSearchMode = true;
  }

  closeSearch() {
    this.isSearchMode = false;
    this.searchQuery = '';
  }

}
