import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroSearch } from '../hero-search/hero-search';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeroSearch],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
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
