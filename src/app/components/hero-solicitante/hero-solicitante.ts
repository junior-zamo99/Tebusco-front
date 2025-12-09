import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroSearch } from '../hero-search/hero-search';

@Component({
  selector:  'app-hero-solicitante',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeroSearch],
  templateUrl:  './hero-solicitante.html',
  styleUrls: ['./hero-solicitante.css'],
})
export class HeroSolicitante {
  searchTerm: string = '';
  isSearchOpen: boolean = false;

  openSearch(): void {
    this.isSearchOpen = true;
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  onSearchChange(): void {
    if (this.searchTerm.length >= 2) {
      this.isSearchOpen = true;
    } else {
      this.isSearchOpen = false;
    }
  }
}
