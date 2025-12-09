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

  documents: DocumentInfo[] = [
    {
      documentType: 'ci_front',
      label: 'CI - Frontal',
      description: 'Parte frontal de tu cédula',
      icon: '🪪',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: false // Cambiado a false
    },
    {
      documentType: 'ci_back',
      label: 'CI - Reverso',
      description: 'Parte posterior de tu cédula',
      icon: '🪪',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: false // Cambiado a false
    },
    {
      documentType: 'selfie',
      label: 'Selfie',
      description: 'Foto actual de tu rostro',
      icon: '🤳',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: false // Cambiado a false
    },
    {
      documentType: 'selfie_with_ci',
      label: 'Selfie con CI',
      description: 'Sosteniendo tu cédula',
      icon: '📸',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: false // Cambiado a false
    },
    {
      documentType: 'curriculum',
      label: 'Currículum Vitae',
      description: 'CV actualizado (Opcional)',
      icon: '📄',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: false
    },
    {
      documentType: 'certificate',
      label: 'Certificados',
      description: 'Títulos o diplomas (Opcional)',
      icon: '🎓',
      status: 'pending',
      fileId: null,
      fileName: null,
      fileUrl: null,
      rejectionReason: null,
      uploading: false,
      uploadProgress: 0,
      required: false
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

  // ... (El código de loadProfessionalData, checkProfessionalStatus, loadExistingDocuments se mantiene igual) ...
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
          } else {
            alert('Debes completar el proceso de upgrade primero');
            this.router.navigate(['/professional/upgrade']);
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

  // ... (Los métodos de subida onFileSelected, onDrop, uploadFile, associateDocument se mantienen igual) ...
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
    // ... (Mantener lógica de validación y subida igual que antes)
    this.errorMessage = '';
    this.successMessage = '';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (['ci_front', 'ci_back', 'selfie', 'selfie_with_ci'].includes(document.documentType)) {
       if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
         this.errorMessage = `Solo se permiten imágenes JPG, PNG o WEBP para ${document.label}`;
         return;
       }
    }
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = `Tipo de archivo no permitido para ${document.label}`;
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'El archivo no debe superar los 10MB';
      return;
    }

    document.uploading = true;
    document.uploadProgress = 0;
    const progressInterval = setInterval(() => {
      if (document.uploadProgress < 90) document.uploadProgress += 10;
    }, 200);

    this.fileService.uploadFile(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fileResponse) => {
          clearInterval(progressInterval);
          document.uploadProgress = 100;
          this.associateDocument(fileResponse.data.id, fileResponse.data.name, fileResponse.data.url, document);
        },
        error: (error) => {
          clearInterval(progressInterval);
          document.uploading = false;
          this.errorMessage = `Error al subir ${document.label}: ${error.error?.message}`;
        }
      });
  }

  private associateDocument(fileId: number, fileName: string, fileUrl: string, document: DocumentInfo) {
      // ... (Mantener lógica igual)
      if (!this.professionalId) return;
      this.professionalService.uploadDocument(this.professionalId, fileId, document.documentType as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          document.uploading = false;
          document.uploadProgress = 0;
          document.fileId = fileId;
          document.fileName = fileName;
          document.fileUrl = fileUrl;
          document.status = 'uploaded';
          this.successMessage = `✓ ${document.label} subido correctamente`;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          document.uploading = false;
          this.errorMessage = `Error al asociar documento`;
        }
      });
  }

  removeDocument(document: DocumentInfo) {
    if (confirm(`¿Estás seguro de eliminar ${document.label}?`)) {
      document.fileId = null;
      document.fileName = null;
      document.fileUrl = null;
      document.status = 'pending';
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


  get isComplete(): boolean {
    return this.uploadedCount === this.documents.length;
  }

  get canContinue(): boolean {
    return true;
  }


  onContinue() {
    this.router.navigate(['/professional/plans']);
  }

  onBack() {
    this.router.navigate(['/professional/upgrade']);
  }

  canUpload(document: DocumentInfo): boolean {
    return (
      (document.status === 'pending' || document.status === 'rejected') &&
      !document.uploading &&
      !this.isLoading
    );
  }

  getAcceptedFormats(documentType: string): string {
    if (documentType === 'curriculum') return 'application/pdf,application/msword';
    return 'image/jpeg,image/jpg,image/png,image/webp';
  }

  getAcceptedFormatsLabel(documentType: string): string {
    if (documentType === 'curriculum') return 'PDF, DOC';
    return 'JPG, PNG, WEBP';
  }

  isImage(doc: DocumentInfo): boolean {
    if (!doc.fileUrl) return false;
    const extension = doc.fileUrl.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
  }
}
