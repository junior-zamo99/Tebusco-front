import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileViewsService, ViewerStats } from '../../services/profile-views.service';

@Component({
  selector: 'app-profile-view-componet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-view-componet.html',
  styleUrls: ['./profile-view-componet.css'],
})
export class ProfileViewComponet implements OnInit {
  viewers: ViewerStats[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private profileViewsService: ProfileViewsService) {}

  ngOnInit(): void {
    this.loadMyViewers();
  }

  loadMyViewers() {
    this.isLoading = true;
    this.profileViewsService.getMyViewers().subscribe({
      next: (response) => {
        if (response.success) {
          this.viewers = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar visualizaciones';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching viewers:', error);
        this.errorMessage = 'Ocurrió un error al conectar con el servidor.';
        this.isLoading = false;
      }
    });
  }
}
