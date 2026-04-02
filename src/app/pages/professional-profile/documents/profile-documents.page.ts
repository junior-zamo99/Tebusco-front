import { Component, OnInit } from '@angular/core';

import { ProfessionalService } from '../../../services/professional.service';
import { ProfileDocumentsComponent } from '../../../components/profile-documents/profile-documents.component';

@Component({
  selector: 'app-profile-documents-page',
  standalone: true,
  imports: [ProfileDocumentsComponent],
  template: `


@if (!loading && professionalId) {
  <app-profile-documents
    [professionalId]="professionalId"
    (documentsUpdated)="onDocumentsUpdated()">
  </app-profile-documents>
}
`
})
export class ProfileDocumentsPage implements OnInit {
  professionalId: number | null = null;
  loading = true;

  constructor(private professionalService: ProfessionalService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionalId = response.data.professional.id;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onDocumentsUpdated() {
    // Puedes recargar datos si es necesario
    console.log('Documentos actualizados');
  }
}
