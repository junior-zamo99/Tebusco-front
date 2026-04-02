import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProfessionalService } from '../../services/professional.service';
import { FileService } from '../../services/file.service';

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
}

@Component({
  selector: 'app-profile-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-documents.component.html',
  styleUrl: './profile-documents.component.css'
})
export class ProfileDocumentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() professionalId: number | null = null;
  @Output() documentsUpdated = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Lightbox state
  selectedImage: { url: string; label: string } | null = null;

  documents: DocumentInfo[] = [
    {
      documentType: 'ci_front',
      label: 'CI - Frontal',
      description: 'Parte frontal de tu cédula',
      icon: 'fa-id-card',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0
    },
    {
      documentType: 'ci_back',
      label: 'CI - Reverso',
      description: 'Parte posterior de tu cédula',
      icon: 'fa-id-card',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0
    },
    {
      documentType: 'selfie',
      label: 'Selfie',
      description: 'Foto actual de tu rostro',
      icon: 'fa-camera',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0
    },
    {
      documentType: 'selfie_with_ci',
      label: 'Selfie con CI',
      description: 'Sosteniendo tu cédula',
      icon: 'fa-image',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0
    },
  ];

  constructor(
    private professionalService: ProfessionalService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    console.log('[ProfileDocuments] ngOnInit - professionalId recibido:', this.professionalId);
    
    // Si el ID viene del padre (recomendado), usarlo directamente
    if (this.professionalId) {
      console.log('[ProfileDocuments] Usando ID del padre:', this.professionalId);
      this.loadExistingDocuments();
    } else {
      // Fallback: intentar obtenerlo de localStorage o del servicio
      console.log('[ProfileDocuments] ID no recibido, intentando obtenerlo...');
      this.loadProfessionalData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfessionalData() {
    const storedId = localStorage.getItem('professionalId');
    if (storedId) {
      this.professionalId = parseInt(storedId, 10);
      this.loadExistingDocuments();
    } else {
      this.checkProfessionalStatus();
    }
  }

  private checkProfessionalStatus() {
    this.isLoading = true;
    this.professionalService.getProfessionalStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data.isProfessional) {
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
                }
              });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al verificar estado del profesional';
        }
      });
  }

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
        }
      });
  }

  onFileSelected(event: Event, document: DocumentInfo) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0], document);
    }
  }

  onDrop(event: DragEvent, document: DocumentInfo) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.uploadFile(event.dataTransfer.files[0], document);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  private uploadFile(file: File, document: DocumentInfo) {
    this.errorMessage = '';
    this.successMessage = '';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = `Solo se permiten imágenes JPG, PNG o WEBP para ${document.label}`;
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'El archivo no debe superar los 10MB';
      return;
    }

    console.log('[ProfileDocuments] Iniciando upload de archivo:', file.name, 'para documento:', document.documentType);

    document.uploading = true;
    document.uploadProgress = 0;
    const progressInterval = setInterval(() => {
      if (document.uploadProgress < 90) document.uploadProgress += 10;
    }, 200);

    this.fileService.uploadFile(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fileResponse) => {
          console.log('[ProfileDocuments] Paso A completado - Archivo subido:', fileResponse.data);
          clearInterval(progressInterval);
          document.uploadProgress = 100;
          this.associateDocument(fileResponse.data.id, fileResponse.data.name, fileResponse.data.url, document);
        },
        error: (error) => {
          console.error('[ProfileDocuments] Error en Paso A:', error);
          clearInterval(progressInterval);
          document.uploading = false;
          this.errorMessage = `Error al subir ${document.label}: ${error.error?.message}`;
        }
      });
  }

  private associateDocument(fileId: number, fileName: string, fileUrl: string, document: DocumentInfo) {
      console.log('[ProfileDocuments] Iniciando Paso B - Asociar documento');
      console.log('[ProfileDocuments] professionalId:', this.professionalId);
      console.log('[ProfileDocuments] fileId:', fileId);
      console.log('[ProfileDocuments] documentType:', document.documentType);
      
      if (!this.professionalId) {
        console.error('[ProfileDocuments] ERROR: professionalId es NULL - No se puede asociar el documento');
        this.errorMessage = 'Error: No se pudo identificar el profesional. Por favor, recarga la página.';
        document.uploading = false;
        return;
      }
      
      this.professionalService.uploadDocument(this.professionalId, fileId, document.documentType as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[ProfileDocuments] Paso B completado - Documento asociado exitosamente:', response);
          document.uploading = false;
          document.uploadProgress = 0;
          document.fileId = fileId;
          document.fileName = fileName;
          document.fileUrl = fileUrl;
          document.status = 'uploaded';
          this.successMessage = `✓ ${document.label} subido correctamente`;
          this.documentsUpdated.emit();
          console.log('[ProfileDocuments] Estado del documento actualizado:', document);
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('[ProfileDocuments] Error en Paso B:', error);
          document.uploading = false;
          this.errorMessage = `Error al asociar documento: ${error.error?.message || 'Error desconocido'}`;
        }
      });
  }

  removeDocument(document: DocumentInfo) {
    if (confirm(`¿Estás seguro de eliminar ${document.label}?`)) {
      document.fileId = null;
      document.fileName = null;
      document.fileUrl = null;
      document.status = 'pending';
      this.documentsUpdated.emit();
    }
  }

  getFileUrl(fileUrl: string | null): string {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    const baseUrl = environment.backendUrl || 'http://localhost:3000';
    return `${baseUrl}/${fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl}`;
  }

  get uploadedCount(): number {
    return this.documents.filter(d =>
      d.status === 'uploaded' || d.status === 'approved'
    ).length;
  }

  get progressPercentage(): number {
    return (this.uploadedCount / this.documents.length) * 100;
  }

  canUpload(document: DocumentInfo): boolean {
    return (
      (document.status === 'pending' || document.status === 'rejected') &&
      !document.uploading &&
      !this.isLoading
    );
  }

  getAcceptedFormats(_documentType: string): string {
    return 'image/jpeg,image/jpg,image/png,image/webp';
  }

  getAcceptedFormatsLabel(_documentType: string): string {
    return 'JPG, PNG, WEBP';
  }

  isImage(doc: DocumentInfo): boolean {
    if (!doc.fileUrl) return false;
    const extension = doc.fileUrl.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
  }

  // Lightbox methods
  openLightbox(doc: DocumentInfo): void {
    if (this.isImage(doc) && doc.fileUrl) {
      this.selectedImage = {
        url: this.getFileUrl(doc.fileUrl),
        label: doc.label
      };
    }
  }

  closeLightbox(): void {
    this.selectedImage = null;
  }

  // Status badge styling
  getStatusClasses(status: string): string {
    switch(status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'uploaded': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    }
  }

  getStatusLabel(status: string): string {
    const labels: {[key:string]: string} = {
      'approved': 'Aprobado',
      'uploaded': 'Subido',
      'rejected': 'Rechazado',
      'pending': 'Pendiente'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: {[key:string]: string} = {
      'approved': 'fa-check-circle',
      'uploaded': 'fa-clock',
      'rejected': 'fa-times-circle',
      'pending': 'fa-circle'
    };
    return icons[status] || 'fa-circle';
  }
}
