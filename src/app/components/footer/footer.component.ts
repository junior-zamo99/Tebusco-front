import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';

  constructor(private router: Router) {}

  onNewsletterSubmit(event: Event): void {
    event.preventDefault();
    console.log('Newsletter subscription:', this.newsletterEmail);
    this.newsletterEmail = '';
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
  }
}
