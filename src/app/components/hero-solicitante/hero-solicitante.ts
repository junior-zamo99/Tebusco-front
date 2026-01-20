import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroSearch } from '../hero-search/hero-search';
import { Country, City } from '../../models/location.model';
import { LocationService } from '../../services/location.service';

@Component({
  selector:  'app-hero-solicitante',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeroSearch],
  templateUrl:  './hero-solicitante.html',
  styleUrls: ['./hero-solicitante.css'],
})
export class HeroSolicitante implements OnInit {

  searchTerm: string = '';
  isSearchMode: boolean = false;

  countries: Country[] = [];
  cities: City[] = [];

  selectedCountryId: number | null = null;
  selectedCityId: number | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.locationService.getCountries().subscribe({
      next: (data) => {
        this.countries = data;
        const bolivia = this.countries.find(c => c.code === 'BO');
        if (bolivia) {
            this.selectedCountryId = bolivia.id;
            this.onCountryChange();
        }
      },
      error: (err) => console.error(err)
    });
  }

  onCountryChange() {
    this.cities = [];
    this.selectedCityId = null;

    if (this.selectedCountryId) {
      this.locationService.CitiesByCountry(this.selectedCountryId).subscribe({
        next: (data) => {
           this.cities = data;

           if(this.cities.length > 0) {

           }
        }
      });
    }
  }

  activateSearch(): void {
    this.isSearchMode = true;
  }

  closeSearch(): void {
    this.isSearchMode = false;
    this.searchTerm = '';
  }
}
