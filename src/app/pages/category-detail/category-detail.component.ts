import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileCategoryService, PortfolioPhoto, CategoryCertificate, ProfileCategoryCV } from '../../services/profile-category.service';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-detail.component.html',
})
export class CategoryDetailComponent implements OnInit {
  categoryId: number | null = null;
  professionalId: number | null = null;

  categoryData: any = null;
  publicCategory: CategoryNode | null = null;

  loading = true;
  saving = false;
  error: string | null = null;

  selectedSpecialties: Set<number> = new Set();

  portfolioPhotos: PortfolioPhoto[] = [];
  certificates: CategoryCertificate[] = [];
  cv: ProfileCategoryCV | null = null;
  uploadingPhoto = false;
  uploadingCert = false;
  uploadingCv = false;
  pendingCertTitle = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileCategoryService: ProfileCategoryService,
    private categoryService: CategoryService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];

      const userData = this.storageService.getProfessional();
      if (userData && userData.id) {
        this.professionalId = userData.id;
        this.loadCategoryDetails();
      } else {
        this.error = 'No se pudo obtener el ID del profesional';
        this.loading = false;
      }
    });
  }

  loadCategoryDetails() {
    if (!this.professionalId || !this.categoryId) {
      this.error = 'Datos incompletos';
      this.loading = false;
      return;
    }

    this.profileCategoryService.getProfileCategoryById(this.professionalId, this.categoryId).subscribe({
      next: (res) => {
        if (res.success) {
          this.categoryData = res.data;

          // 1. Limpiamos selección previa
          this.selectedSpecialties.clear();

          // 2. Lógica corregida para leer tu JSON actual
          if (this.categoryData.specialties && Array.isArray(this.categoryData.specialties)) {
            this.categoryData.specialties.forEach((s: any) => {

              // TU JSON USA "categoryId" PARA IDENTIFICAR LA ESPECIALIDAD
              // Probamos en este orden de prioridad:

              let idToAdd = null;

              if (s.categoryId) {
                 // Caso actual según tu JSON: { id: 295, categoryId: 11, ... }
                 idToAdd = s.categoryId;
              } else if (s.specialty && s.specialty.id) {
                 // Caso objeto anidado: { specialty: { id: 11 } }
                 idToAdd = s.specialty.id;
              } else if (s.specialtyId) {
                 // Caso columna plana: { specialtyId: 11 }
                 idToAdd = s.specialtyId;
              }

              // Si encontramos un ID válido, lo agregamos al Set visual
              if (idToAdd) {
                this.selectedSpecialties.add(idToAdd);
              }
            });
          }

          console.log('Especialidades cargadas visualmente:', this.selectedSpecialties);

          // 3. Cargar las opciones públicas (Checkboxes)
          this.categoryService.getCategoryById(this.categoryData.categoryId).subscribe({
            next: (catRes) => {
              this.publicCategory = catRes;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading public category', err);
              this.loading = false;
            }
          });

          // 4. Cargar portfolio, certificados y CV
          this.profileCategoryService.getPortfolio(this.professionalId!, this.categoryId!).subscribe({
            next: (res) => { if (res.success) this.portfolioPhotos = res.data || []; }
          });
          this.profileCategoryService.getCertificates(this.professionalId!, this.categoryId!).subscribe({
            next: (res) => { if (res.success) this.certificates = res.data || []; }
          });
          this.profileCategoryService.getCv(this.professionalId!, this.categoryId!).subscribe({
            next: (res) => { if (res.success) this.cv = res.data || null; }
          });
        } else {
          this.error = res.message || 'Error al obtener datos.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar los detalles.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleSpecialty(specialtyId: number) {
      if (this.selectedSpecialties.has(specialtyId)) {
          this.selectedSpecialties.delete(specialtyId);
      } else {
          this.selectedSpecialties.add(specialtyId);
      }
  }

  isSpecialtySelected(specialtyId: number): boolean {
      return this.selectedSpecialties.has(specialtyId);
  }

 save() {
    if (!this.professionalId || !this.categoryId) return;

    this.saving = true;

    const availableSpecialtyIds = this.publicCategory?.children?.map(child => child.id) || [];

    const specialtyIdsArray = Array.from(this.selectedSpecialties)
        .filter(id => availableSpecialtyIds.includes(id));

    const updateData: any = {
      slogan: this.categoryData.slogan,
      description: this.categoryData.description,
      experience: this.categoryData.experience,
      priceMin: this.categoryData.priceMin,
      visible: this.categoryData.visible,
      specialtyIds: specialtyIdsArray
    };

    console.log('IDs disponibles (UI):', availableSpecialtyIds);
    console.log('Enviando datos limpios:', updateData);

    this.profileCategoryService.updateProfileCategory(this.professionalId, this.categoryId, updateData).subscribe({
      next: (res) => {
        this.saving = false;
        this.router.navigate(['/profile-professional-personal'], { queryParams: { tab: 'categories' } });
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al guardar los cambios. Intente nuevamente.';
        console.error('Error en update:', err);
      }
    });
  }

  onPhotoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || this.portfolioPhotos.length >= 5 || !this.professionalId || !this.categoryId) return;
    const file = input.files[0];
    this.uploadingPhoto = true;
    this.profileCategoryService.addPhoto(this.professionalId, this.categoryId, file).subscribe({
      next: (r) => {
        this.uploadingPhoto = false;
        if (r.success && r.data) this.portfolioPhotos.push(r.data);
        input.value = '';
      },
      error: () => { this.uploadingPhoto = false; this.error = 'Error al subir la foto.'; }
    });
  }

  deletePhoto(photoId: number) {
    if (!this.professionalId || !this.categoryId) return;
    this.profileCategoryService.deletePhoto(this.professionalId, this.categoryId, photoId).subscribe({
      next: () => { this.portfolioPhotos = this.portfolioPhotos.filter(p => p.id !== photoId); },
      error: () => this.error = 'Error al eliminar la foto.'
    });
  }

  onCertFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.pendingCertTitle.trim() || !this.professionalId || !this.categoryId) return;
    const file = input.files[0];
    const title = this.pendingCertTitle.trim();
    this.uploadingCert = true;
    this.profileCategoryService.addCertificate(this.professionalId, this.categoryId, file, title).subscribe({
      next: (r) => {
        this.uploadingCert = false;
        if (r.success && r.data) this.certificates.push(r.data);
        this.pendingCertTitle = '';
        input.value = '';
      },
      error: () => { this.uploadingCert = false; this.error = 'Error al subir el certificado.'; }
    });
  }

  deleteCertificate(certId: number) {
    if (!this.professionalId || !this.categoryId) return;
    this.profileCategoryService.deleteCertificate(this.professionalId, this.categoryId, certId).subscribe({
      next: () => { this.certificates = this.certificates.filter(c => c.id !== certId); },
      error: () => this.error = 'Error al eliminar el certificado.'
    });
  }

  onCvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.professionalId || !this.categoryId) return;
    const file = input.files[0];
    this.uploadingCv = true;
    this.profileCategoryService.uploadCv(this.professionalId, this.categoryId, file).subscribe({
      next: (r) => {
        this.uploadingCv = false;
        if (r.success && r.data) this.cv = r.data;
        input.value = '';
      },
      error: () => { this.uploadingCv = false; this.error = 'Error al subir el CV.'; }
    });
  }

  deleteCv() {
    if (!this.professionalId || !this.categoryId || !this.cv) return;
    const cvId = this.cv.id;
    this.profileCategoryService.deleteCv(this.professionalId, this.categoryId, cvId).subscribe({
      next: () => { this.cv = null; },
      error: () => this.error = 'Error al eliminar el CV.'
    });
  }

  resolveUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.backendUrl}${url}`;
  }

  cancel() {
      this.router.navigate(['/profile-professional-personal'], { queryParams: { tab: 'categories' } });
  }
}
