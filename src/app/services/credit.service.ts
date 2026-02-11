import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CreditBalance,
  UserCredit,
  CreditTransactionList,
  CreditTransaction,
  CreditStats,
  CreditValidation,
  CreditTransactionFilters,
  ValidateCreditRequest,
  ApiCreditBalanceResponse,
  ApiUserCreditResponse,
  ApiCreditTransactionsResponse,
  ApiCreditStatsResponse,
  ApiCreditValidationResponse
} from '../models/credit.model';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = `${environment.apiUrl}/credits`;

  constructor(private http: HttpClient) {}


  getMyBalance(): Observable<CreditBalance> {
    return this.http
      .get<ApiCreditBalanceResponse>(`${this.apiUrl}/me/balance`, {
        withCredentials: true
      })
      .pipe(
        map(response => {
          const data = this.transformDates<CreditBalance>(response.data, ['nextExpirationDate']);
          return this.ensureNumberFields<CreditBalance>(data, ['availableCredits', 'expiringCredits']);
        }),
        catchError(this.handleError)
      );
  }


  getMyCredit(): Observable<UserCredit> {
    return this.http
      .get<ApiUserCreditResponse>(`${this.apiUrl}/me`, {
        withCredentials: true
      })
      .pipe(
        map(response => {
          const data = this.transformDates<UserCredit>(response.data, ['nextExpirationDate', 'createdAt', 'updatedAt']);
          return this.ensureNumberFields<UserCredit>(data, ['totalCredits', 'availableCredits', 'usedCredits', 'expiringCredits', 'nextExpirationAmount']);
        }),
        catchError(this.handleError)
      );
  }


  getMyTransactions(filters?: CreditTransactionFilters): Observable<CreditTransactionList> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());
      if (filters.type) params = params.set('type', filters.type);
      if (filters.source) params = params.set('source', filters.source);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.isExpired !== undefined) params = params.set('isExpired', filters.isExpired.toString());
    }

    return this.http
      .get<ApiCreditTransactionsResponse>(`${this.apiUrl}/me/transactions`, {
        params,
        withCredentials: true
      })
      .pipe(
        map(response => {
          const data = response.data;
          if (data.transactions && data.transactions.length > 0) {
            data.transactions = data.transactions.map(transaction => {
              const transformed = this.transformDates<CreditTransaction>(transaction, ['expiresAt', 'createdAt']);
              return this.ensureNumberFields<CreditTransaction>(transformed, ['amount']);
            });
          }
          // Asegurar que los totales también sean números
          return this.ensureNumberFields<CreditTransactionList>(data, ['total', 'totalEarned', 'totalUsed', 'totalExpired']);
        }),
        catchError(this.handleError)
      );
  }


  getMyStats(): Observable<CreditStats> {
    return this.http
      .get<ApiCreditStatsResponse>(`${this.apiUrl}/me/stats`, {
        withCredentials: true
      })
      .pipe(
        map(response => {
          const data = response.data;
          // Asegurar que todos los campos numéricos sean números
          return this.ensureNumberFields<CreditStats>(data, [
            'totalEarned', 'totalUsed', 'totalExpired', 'totalRefunded', 'currentBalance'
          ]);
        }),
        catchError(this.handleError)
      );
  }


  validateCredit(amount: number): Observable<CreditValidation> {
    const body: ValidateCreditRequest = { amount };

    return this.http
      .post<ApiCreditValidationResponse>(`${this.apiUrl}/validate`, body, {
        withCredentials: true
      })
      .pipe(
        map(response => {
          const data = response.data;
          return this.ensureNumberFields<CreditValidation>(data, ['availableCredits', 'requestedAmount']);
        }),
        catchError(this.handleError)
      );
  }

  private transformDates<T>(obj: any, dateFields: string[]): T {
    if (!obj) return obj;

    const transformed = { ...obj };
    dateFields.forEach(field => {
      if (transformed[field] && typeof transformed[field] === 'string') {
        transformed[field] = new Date(transformed[field]);
      }
    });

    return transformed as T;
  }

  /**
   * Helper: Asegura que ciertos campos sean números
   * El backend puede enviar strings, esta función convierte a number
   * @param obj Objeto con propiedades que deben ser números
   * @param numberFields Nombres de las propiedades que son números (soporta paths como 'earnedBySource.referral')
   */
  private ensureNumberFields<T>(obj: any, numberFields: string[]): T {
    if (!obj) return obj;

    const transformed = { ...obj };
    numberFields.forEach(field => {
      // Soporte para objetos anidados usando notación de punto
      if (field.includes('.')) {
        const parts = field.split('.');
        let current = transformed;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]]) {
            current = current[parts[i]];
          } else {
            return; // Path no existe
          }
        }
        const lastKey = parts[parts.length - 1];
        if (current[lastKey] !== undefined && current[lastKey] !== null) {
          const value = current[lastKey];
          current[lastKey] = typeof value === 'string' ? parseFloat(value) : Number(value);
        }
      } else {
        // Campo directo
        if (transformed[field] !== undefined && transformed[field] !== null) {
          const value = transformed[field];
          transformed[field] = typeof value === 'string' ? parseFloat(value) : Number(value);
        }
      }
    });

    return transformed as T;
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error al procesar la solicitud';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
      console.error('Error del cliente:', error.error.message);
    } else {
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      console.error(
        `Error del servidor: Código ${error.status}\n` +
        `Mensaje: ${error.message}\n` +
        `Detalle: ${error.error?.message || 'Sin detalles'}`
      );
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }
}
