import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreditService } from '../../../services/credit.service';
import { CreditTransaction, CreditTransactionList } from '../../../models/credit.model';

@Component({
  selector: 'app-credit-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-history.component.html',
  styleUrls: ['./credit-history.component.css']
})
export class CreditHistoryComponent implements OnInit {
  // State management
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isEmpty = false;

  // Transaction data
  transactions: CreditTransaction[] = [];
  totalItems = 0;
  totalPages = 0;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  pageNumbers: number[] = [];

  // Filters
  selectedType: string = 'all';
  selectedSource: string = 'all';
  selectedDateRange: string = 'all';
  customStartDate = '';
  customEndDate = '';

  // Filter options
  typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'earned', label: 'Ganados' },
    { value: 'used', label: 'Usados' },
    { value: 'expired', label: 'Expirados' },
    { value: 'refunded', label: 'Reembolsados' }
  ];

  sourceOptions = [
    { value: 'all', label: 'Todas las fuentes' },
    { value: 'referral', label: 'Referidos' },
    { value: 'admin', label: 'Administrador' },
    { value: 'promotion', label: 'Promociones' }
  ];

  dateRangeOptions = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: '7', label: 'Últimos 7 días' },
    { value: '30', label: 'Últimos 30 días' },
    { value: '90', label: 'Últimos 90 días' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  constructor(
    private creditService: CreditService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;

    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // Add type filter
    if (this.selectedType !== 'all') {
      params.type = this.selectedType;
    }

    // Add source filter
    if (this.selectedSource !== 'all') {
      params.source = this.selectedSource;
    }

    // Add date range filter
    if (this.selectedDateRange === 'custom') {
      if (this.customStartDate) params.startDate = this.customStartDate;
      if (this.customEndDate) params.endDate = this.customEndDate;
    } else if (this.selectedDateRange !== 'all') {
      const days = parseInt(this.selectedDateRange);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      params.startDate = startDate.toISOString().split('T')[0];
      params.endDate = endDate.toISOString().split('T')[0];
    }

    this.creditService.getMyTransactions(params).subscribe({
      next: (response: CreditTransactionList) => {
        this.transactions = response.transactions;
        
        // Handle pagination info (might not be present in all API responses)
        if (response.pagination) {
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
        } else {
          // Fallback: calculate from response.total if pagination not present
          this.totalItems = response.total || response.transactions.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        }

        this.isEmpty = this.transactions.length === 0;
        this.calculatePageNumbers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.hasError = true;
        this.errorMessage = error.error?.message || 'Error al cargar el historial de transacciones';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadTransactions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  calculatePageNumbers(): void {
    this.pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }

  retry(): void {
    this.loadTransactions();
  }

  goBack(): void {
    this.router.navigate(['/my-credits']);
  }

  // Helper methods for display
  getTransactionIcon(type: string): string {
    switch (type) {
      case 'earned': return '✅';
      case 'used': return '🔻';
      case 'expired': return '⏰';
      case 'refunded': return '🔄';
      default: return '💰';
    }
  }

  getTransactionColorClass(type: string): string {
    switch (type) {
      case 'earned': return 'text-success border-success/30 bg-success/5';
      case 'used': return 'text-primary border-primary/30 bg-primary/5';
      case 'expired': return 'text-warning border-warning/30 bg-warning/5';
      case 'refunded': return 'text-info border-info/30 bg-info/5';
      default: return 'text-text border-border bg-card-bg-light';
    }
  }

  getAmountColorClass(type: string): string {
    switch (type) {
      case 'earned':
      case 'refunded':
        return 'text-success';
      case 'used':
      case 'expired':
        return 'text-danger';
      default:
        return 'text-text';
    }
  }

  getAmountPrefix(type: string): string {
    if (type === 'earned' || type === 'refunded') return '+';
    if (type === 'used' || type === 'expired') return '-';
    return '';
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'earned': return 'Ganado';
      case 'used': return 'Usado';
      case 'expired': return 'Expirado';
      case 'refunded': return 'Reembolsado';
      default: return type;
    }
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'referral': return 'Referido';
      case 'admin': return 'Administrador';
      case 'promotion': return 'Promoción';
      case 'welcome': return 'Bienvenida';
      case 'purchase': return 'Compra';
      default: return source;
    }
  }

  isCustomDateRange(): boolean {
    return this.selectedDateRange === 'custom';
  }

  clearFilters(): void {
    this.selectedType = 'all';
    this.selectedSource = 'all';
    this.selectedDateRange = 'all';
    this.customStartDate = '';
    this.customEndDate = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  hasActiveFilters(): boolean {
    return this.selectedType !== 'all' ||
           this.selectedSource !== 'all' ||
           this.selectedDateRange !== 'all';
  }
}
