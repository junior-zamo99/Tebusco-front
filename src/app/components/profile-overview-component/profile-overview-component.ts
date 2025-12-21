import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Asegúrate de importar tu interfaz correcta
import { ProfessionalCompleteData } from '../../models/professional-complete.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-overview-component.html',
  styleUrls: ['./profile-overview-component.css']
})
export class ProfileOverviewComponent {
  @Input() data!: ProfessionalCompleteData;
  @Output() editClicked = new EventEmitter<void>();

  getPhotoUrl(): string {
    if (!this.data?.user?.photoUrl) return 'assets/default-avatar.png';
    return this.data.user.photoUrl.startsWith('http')
      ? this.data.user.photoUrl
      : `${environment.backendUrl}${this.data.user.photoUrl}`;
  }
}
