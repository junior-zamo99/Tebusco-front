import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professional-complete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-complete.component.html',
  styleUrl: './professional-complete.component.css'
})
export class ProfessionalCompleteComponent implements OnInit {
  showConfetti = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Mostrar animación de confeti
    this.showConfetti = true;

    // Auto-redirigir después de 5 segundos (opcional)
    // setTimeout(() => {
    //   this.goToDashboard();
    // }, 5000);
  }

  goToDashboard() {
    this.router.navigate(['/professional/dashboard']);
  }

  viewProfile() {
    this.router.navigate(['/profile']);
  }
}
