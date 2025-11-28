/**
 * Modelo para respuesta del servidor al subir archivo
 */
export interface FileResponse {
  id: number;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

/**
 * Modelo para respuesta de la API al subir archivo
 */
export interface FileUploadApiResponse {
  success: boolean;
  data: FileResponse;
  message: string;
}
