import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProfessionalService } from '../../../services/professional.service';
import { FileService } from '../../../services/file.service';

interface DocumentInfo {
  id: number;
  documentType: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  fileId?: number | null;
  fileName?: string | null;
  fileUrl?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
}

const DOCUMENT_LABELS: { [key: string]: string } = {
  'ci_front': 'Cédula de Identidad - Frontal',
  'ci_back': 'Cédula de Identidad - Reverso',
  'selfie': 'Fotografía Selfie',
  'selfie_with_ci': 'Selfie con Cédula',
  'curriculum': 'Currículum Vitae',
  'certificate': 'Certificados y Títulos'
};

const DOCUMENT_ICONS: { [key: string]: string } = {
  'ci_front': '🪪',
  'ci_back': '🪪',
  'selfie': '🤳',
  'selfie_with_ci': '📸',
  'curriculum': '📄',
  'certificate': '🎓'
};

const DOCUMENT_DESCRIPTIONS: { [key: string]: string } = {
  'ci_front': 'Parte frontal de tu cédula de identidad vigente',
  'ci_back': 'Parte posterior de tu cédula de identidad',
  'selfie': 'Una fotografía actual y clara de tu rostro',
  'selfie_with_ci': 'Fotografía tuya sosteniendo tu cédula junto a tu rostro',
  'curriculum': 'Tu currículum vitae actualizado',
  'certificate': 'Certificados, títulos o diplomas que respalden tu experiencia'
};

const VERIFICATION_ORDER = ['ci_front', 'ci_back', 'selfie', 'selfie_with_ci'];

const ADDITIONAL_ORDER = ['curriculum', 'certificate'];

@Component({
  selector: 'app-step-2-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-2-documents.html',
  styleUrl: './step-2-documents.css'
})
export class Step2DocumentsComponent implements OnInit, OnDestroy {
  @Input() professionalData: any;
  @Output() nextStep = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  documents: DocumentInfo[] = [];
  uploadingDocuments: { [key: string]: boolean } = {};
  uploadProgress: { [key: string]: number } = {};
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private professionalService: ProfessionalService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }


  private loadDocuments() {
    if (!this.professionalData?.id) {
      this.error = 'ID del profesional no disponible';
      return;
    }

    this.isLoading = true;
    this.professionalService
      .getDocuments(this.professionalData.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.data) {
            this.documents = response.data.map((doc: any) => ({
              ...doc,
              documentType: doc.documentType.toLowerCase()
            }));
            this.error = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar documentos: ' + (error.error?.message || error.message);
          console.error('Error loading documents:', error);
          this.isLoading = false;
        }
      });
  }


  getDocumentLabel(documentType: string): string {
    const normalized = documentType.toLowerCase();
    return DOCUMENT_LABELS[normalized] || documentType;
  }


  getDocumentDescription(documentType: string): string {
    const normalized = documentType.toLowerCase();
    return DOCUMENT_DESCRIPTIONS[normalized] || '';
  }


  getDocumentIcon(documentType: string): string {
    const normalized = documentType.toLowerCase();
    return DOCUMENT_ICONS[normalized] || '📄';
  }


  isVerificationDocument(documentType: string): boolean {
    const normalized = documentType.toLowerCase();
    return VERIFICATION_ORDER.includes(normalized);
  }

  private sortDocuments(docs: DocumentInfo[], order: string[]): DocumentInfo[] {
    return docs.sort((a, b) => {
      const normalizedA = a.documentType.toLowerCase();
      const normalizedB = b.documentType.toLowerCase();
      const indexA = order.indexOf(normalizedA);
      const indexB = order.indexOf(normalizedB);
      return indexA - indexB;
    });
  }


  get verificationDocuments(): DocumentInfo[] {
    const docs = this.documents.filter(doc => this.isVerificationDocument(doc.documentType));
    return this.sortDocuments(docs, VERIFICATION_ORDER);
  }


  get additionalDocuments(): DocumentInfo[] {
    const docs = this.documents.filter(doc => !this.isVerificationDocument(doc.documentType));
    return this.sortDocuments(docs, ADDITIONAL_ORDER);
  }


  get uploadedVerificationCount(): number {
    return this.verificationDocuments.filter(
      doc => doc.status === 'uploaded' || doc.status === 'approved'
    ).length;
  }


  get totalVerificationCount(): number {
    return this.verificationDocuments.length;
  }


  get progressPercentage(): number {
    if (this.totalVerificationCount === 0) return 0;
    return (this.uploadedVerificationCount / this.totalVerificationCount) * 100;
  }


  get hasUploadedDocuments(): boolean {
    return this.uploadedVerificationCount > 0;
  }


  onFileSelected(event: any, document: DocumentInfo) {
    const file: File = event.target.files?.[0];

    if (!file) {
      return;
    }

    this.error = null;
    this.successMessage = null;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.error = `El archivo "${file.name}" excede el tamaño máximo de 10MB`;
      return;
    }

    const allowedMimes = this.getAllowedMimeTypes(document.documentType);
    if (!allowedMimes.includes(file.type)) {
      this.error = `Tipo de archivo no permitido para ${this.getDocumentLabel(document.documentType)}. Tipos aceptados: ${this.getAllowedExtensions(document.documentType)}`;
      return;
    }

    this.uploadingDocuments[document.documentType] = true;
    this.uploadProgress[document.documentType] = 0;

    const progressInterval = setInterval(() => {
      if (this.uploadProgress[document.documentType] < 90) {
        this.uploadProgress[document.documentType] += 10;
      }
    }, 200);


    this.fileService
      .uploadFile(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fileResponse) => {
          clearInterval(progressInterval);
          this.uploadProgress[document.documentType] = 100;

          if (fileResponse?.data?.id) {
            this.uploadDocument(fileResponse.data.id, document.documentType);
          } else {
            this.uploadingDocuments[document.documentType] = false;
            this.error = 'Respuesta de archivo inválida';
          }
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.uploadingDocuments[document.documentType] = false;
          this.uploadProgress[document.documentType] = 0;
          this.error = `Error al subir archivo: ${error.error?.message || error.message}`;
          console.error('Error uploading file:', error);
        }
      });
  }


  private getAllowedMimeTypes(documentType: string): string[] {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const pdfTypes = ['application/pdf'];
    const docTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const normalized = documentType.toLowerCase();

    if (['ci_front', 'ci_back', 'selfie', 'selfie_with_ci'].includes(normalized)) {
      return imageTypes;
    }
    if (normalized === 'curriculum') {
      return [...pdfTypes, ...docTypes];
    }
    if (normalized === 'certificate') {
      return [...imageTypes, ...pdfTypes];
    }
    return [...imageTypes, ...pdfTypes];
  }

   getFileUrl(fileUrl: string | null | undefined): string {
    if (!fileUrl) return '';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    const baseUrl = environment.backendUrl || 'http://localhost:3000';
    const path = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${baseUrl}/${path}`;
  }


  getAllowedExtensions(documentType: string): string {
    const normalized = documentType.toLowerCase();

    if (['ci_front', 'ci_back', 'selfie', 'selfie_with_ci'].includes(normalized)) {
      return 'JPG, PNG, WebP';
    }
    if (normalized === 'curriculum') {
      return 'PDF, DOC, DOCX';
    }
    if (normalized === 'certificate') {
      return 'JPG, PNG, PDF';
    }
    return 'JPG, PNG, PDF';
  }

  private uploadDocument(fileId: number, documentType: string) {
    // if (!this.professionalData?.id) {
    //   this.uploadingDocuments[documentType] = false;
    //   this.error = 'ID del profesional no disponible';
    //   return;
    // }

    // this.professionalService
    //   .uploadDocument(this.professionalData.id, fileId, documentType)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       this.uploadingDocuments[documentType] = false;
    //       this.uploadProgress[documentType] = 0;
    //       this.error = null;
    //       this.successMessage = `✓ ${this.getDocumentLabel(documentType)} subido correctamente`;

    //       setTimeout(() => {
    //         this.successMessage = null;
    //       }, 3000);

    //       this.loadDocuments();
    //     },
    //     error: (error) => {
    //       this.uploadingDocuments[documentType] = false;
    //       this.uploadProgress[documentType] = 0;
    //       this.error = `Error al subir documento: ${error.error?.message || error.message}`;
    //       console.error('Error uploading document:', error);
    //     }
    //   });
  }


  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'bg-card-bg-light/50 border-border/50 hover:border-border',
      uploaded: 'bg-success/5 border-success/20 hover:border-success/30',
      approved: 'bg-success/10 border-success/30 hover:border-success/40',
      rejected: 'bg-danger/5 border-danger/20 hover:border-danger/30'
    };
    return colors[status] || 'bg-card-bg-light/50 border-border/50';
  }


  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'bg-card-bg border-border text-text-light',
      uploaded: 'bg-success/15 border-success/30 text-success',
      approved: 'bg-success/20 border-success/40 text-success',
      rejected: 'bg-danger/15 border-danger/30 text-danger'
    };
    return colors[status] || 'bg-card-bg border-border text-text-light';
  }


  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      pending: 'Pendiente',
      uploaded: 'Subido',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return texts[status] || status;
  }


  canUpload(document: DocumentInfo): boolean {
    return (document.status === 'pending' || document.status === 'rejected') &&
           !this.uploadingDocuments[document.documentType] &&
           !this.isLoading;
  }


  onNext() {
    this.isLoading = true;
    setTimeout(() => {
      this.nextStep.emit();
      this.isLoading = false;
    }, 500);
  }


  onBack() {
    this.back.emit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
