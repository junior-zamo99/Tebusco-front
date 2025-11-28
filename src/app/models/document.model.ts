export interface ProfessionalDocument {
  id: number;
  documentType: DocumentType;
  documentTypeLabel: string;
  fileId: number | null;
  fileName: string | null;
  fileUrl: string | null;
  status: DocumentStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export type DocumentType = 'ci_front' | 'ci_back' | 'selfie' | 'selfie_with_ci';

export type DocumentStatus = 'pending' | 'uploaded' | 'approved' | 'rejected';

export interface DocumentTypeOption {
  code: DocumentType;
  label: string;
}

export interface UploadDocumentRequest {
  fileId: number;
  documentType: DocumentType;
}
