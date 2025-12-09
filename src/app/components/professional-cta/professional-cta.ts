import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professional-cta',
  imports: [],
  templateUrl: './professional-cta.html',
  styleUrl: './professional-cta.css',
})
export class ProfessionalCta {

  constructor(
    private router: Router
  ){ }


  navigateToExtras() {
    this.router.navigate(['/extras']);
  }

}
