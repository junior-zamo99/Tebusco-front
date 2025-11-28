import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProfessionalService } from '../../../services/professional.service';
import { FileService } from '../../../services/file.service';

interface DocumentInfo {
  id?: number;
  documentType: string;
  label: string;
  description: string;
  icon: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  fileId: number | null;
  fileName: string | null;
  fileUrl: string | null;
  rejectionReason: string | null;
  uploading: boolean;
  uploadProgress: number;
  required: boolean;
}

@Component({
  selector: 'app-professional-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-documents.component.html',
  styleUrl: './professional-documents.component.css'
})
export class ProfessionalDocumentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  professionalId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // 📄 Documentos obligatorios
  documents: DocumentInfo[] = [
    {
      documentType: 'ci_front',
      label: 'CI - Frontal',
      description: 'Parte frontal de tu cédula de identidad vigente',
      icon: '🪪',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: true
    },
    {
      documentType: 'ci_back',
      label: 'CI - Reverso',
      description: 'Parte posterior de tu cédula de identidad',
      icon: '🪪',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: true
    },
    {
      documentType: 'selfie',
      label: 'Selfie',
      description: 'Una fotografía actual y clara de tu rostro',
      icon: '🤳',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: true
    },
    {
      documentType: 'selfie_with_ci',
      label: 'Selfie con CI',
      description: 'Fotografía tuya sosteniendo tu cédula junto a tu rostro',
      icon: '📸',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: true
    }
  ];

  constructor(
    private router: Router,
    private professionalService: ProfessionalService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    this.loadProfessionalData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 📥 Cargar datos del profesional y documentos existentes
   */
  private loadProfessionalData() {
    // Obtener professionalId del localStorage (guardado en el upgrade)
    const storedId = localStorage.getItem('professionalId');

    if (storedId) {
      this.professionalId = parseInt(storedId, 10);
      this.loadExistingDocuments();
    } else {
      // Si no hay professionalId, verificar estado
      this.checkProfessionalStatus();
    }
  }

  /**
   * 🔍 Verificar estado del profesional
   */
  private checkProfessionalStatus() {
    this.isLoading = true;

    this.professionalService.getProfessionalStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.data.isProfessional) {
            // Obtener professionalId desde el perfil
            this.professionalService.getMe()
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (profileResponse) => {
                  this.professionalId = profileResponse.data.id;
                  localStorage.setItem('professionalId', this.professionalId!.toString());
                  this.loadExistingDocuments();
                },
                error: (error) => {
                  this.errorMessage = 'Error al cargar perfil profesional';
                  console.error('Error:', error);
                }
              });
          } else {
            // No es profesional, redirigir al upgrade
            alert('Debes completar el proceso de upgrade primero');
            this.router.navigate(['/professional/upgrade']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al verificar estado del profesional';
          console.error('Error:', error);
        }
      });
  }

  /**
   * 📋 Cargar documentos existentes
   */
  private loadExistingDocuments() {
    if (!this.professionalId) return;

    this.isLoading = true;

    this.professionalService.getDocuments(this.professionalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response?.data) {
            const existingDocs = response.data;

            // Actualizar estado de documentos
            existingDocs.forEach((serverDoc: any) => {
              const docIndex = this.documents.findIndex(
                d => d.documentType === serverDoc.documentType
              );

              if (docIndex !== -1) {
                this.documents[docIndex] = {
                  ...this.documents[docIndex],
                  id: serverDoc.id,
                  status: serverDoc.status,
                  fileId: serverDoc.fileId,
                  fileName: serverDoc.fileName,
                  fileUrl: serverDoc.fileUrl,
                  rejectionReason: serverDoc.rejectionReason
                };
              }
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar documentos existentes';
          console.error('Error:', error);
        }
      });
  }

  /**
   * 📤 Manejar selección de archivo
   */
  onFileSelected(event: Event, document: DocumentInfo) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadFile(file, document);
    }
  }

  /**
   * 🎯 Manejar drop de archivo
   */
  onDrop(event: DragEvent, document: DocumentInfo) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      this.uploadFile(file, document);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * ⬆️ Subir archivo
   */
  private uploadFile(file: File, document: DocumentInfo) {
    this.errorMessage = '';
    this.successMessage = '';

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = `Solo se permiten imágenes JPG, PNG o WEBP para ${document.label}`;
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'El archivo no debe superar los 10MB';
      return;
    }

    document.uploading = true;
    document.uploadProgress = 0;

    // Simular progreso
    const progressInterval = setInterval(() => {
      if (document.uploadProgress < 90) {
        document.uploadProgress += 10;
      }
    }, 200);

    // PASO 5: Subir archivo
    this.fileService.uploadFile(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fileResponse) => {
          clearInterval(progressInterval);
          document.uploadProgress = 100;

          const fileId = fileResponse.data.id;
          const fileName = fileResponse.data.name;
          const fileUrl = fileResponse.data.url;

          // PASO 6: Asociar archivo a documento profesional
          this.associateDocument(fileId, fileName, fileUrl, document);
        },
        error: (error) => {
          clearInterval(progressInterval);
          document.uploading = false;
          document.uploadProgress = 0;
          this.errorMessage = `Error al subir ${document.label}: ${error.error?.message || error.message}`;
          console.error('Upload error:', error);
        }
      });
  }

  /**
   * 🔗 Asociar archivo a documento profesional
   */
  private associateDocument(fileId: number, fileName: string, fileUrl: string, document: DocumentInfo) {
    if (!this.professionalId) {
      document.uploading = false;
      this.errorMessage = 'ID del profesional no disponible';
      return;
    }

    this.professionalService.uploadDocument(
      this.professionalId,
      fileId,
      document.documentType as any
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        document.uploading = false;
        document.uploadProgress = 0;
        document.fileId = fileId;
        document.fileName = fileName;
        document.fileUrl = fileUrl;
        document.status = 'uploaded';
        document.rejectionReason = null;

        this.successMessage = `✓ ${document.label} subido correctamente`;

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        document.uploading = false;
        document.uploadProgress = 0;
        this.errorMessage = `Error al asociar ${document.label}: ${error.error?.message || error.message}`;
        console.error('Associate error:', error);
      }
    });
  }

  /**
   * 🗑️ Remover documento
   */
  removeDocument(document: DocumentInfo) {
    if (confirm(`¿Estás seguro de eliminar ${document.label}?`)) {
      document.fileId = null;
      document.fileName = null;
      document.fileUrl = null;
      document.status = 'pending';
      document.rejectionReason = null;
    }
  }

  /**
   * 🎨 Obtener URL completa del archivo
   */
  getFileUrl(fileUrl: string | null): string {
    if (!fileUrl) return '';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    const baseUrl = environment.backendUrl || 'http://localhost:3000';
    const path = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${baseUrl}/${path}`;
  }

  /**
   * 📊 Calcular progreso
   */
  get uploadedCount(): number {
    return this.documents.filter(d =>
      d.status === 'uploaded' || d.status === 'approved'
    ).length;
  }

  get progressPercentage(): number {
    return (this.uploadedCount / this.documents.length) * 100;
  }

  get canContinue(): boolean {
    return this.uploadedCount === this.documents.length;
  }

  /**
   * ➡️ Continuar al siguiente paso
   */
  onContinue() {
    if (!this.canContinue) {
      alert(`Debes subir los ${this.documents.length} documentos obligatorios para continuar`);
      return;
    }

    // Navegar a la página de suscripción/planes
    this.router.navigate(['/professional/plans']);
  }

  /**
   * ⬅️ Volver al paso anterior
   */
  onBack() {
    this.router.navigate(['/professional/upgrade']);
  }

  /**
   * 🔄 Verificar si puede subir
   */
  canUpload(document: DocumentInfo): boolean {
    return (
      (document.status === 'pending' || document.status === 'rejected') &&
      !document.uploading &&
      !this.isLoading
    );
  }

  /**
   * 🎨 Obtener clase CSS según estado
   */
  getStatusClass(document: DocumentInfo): string {
    if (document.uploading) return 'uploading';
    if (document.status === 'approved') return 'approved';
    if (document.status === 'uploaded') return 'uploaded';
    if (document.status === 'rejected') return 'rejected';
    return 'pending';
  }
}
