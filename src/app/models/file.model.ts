export interface FileUploadResponse {
  id: number;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

export interface FileUploadRequest {
  file: File;
}

export type AllowedMimeTypes = 'image/jpeg' | 'image/png' | 'image/webp';

export const ALLOWED_FILE_TYPES: AllowedMimeTypes[] = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
