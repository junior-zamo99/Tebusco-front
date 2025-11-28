import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';

@Component({
  selector: 'app-categories-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-carousel.html',
  styleUrls: ['./categories-carousel.css']
})
export class CategoriesCarouselComponent implements OnInit, AfterViewInit {
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  categories: CategoryNode[] = [];
  isLoading = true;
  canScrollLeft = false;
  canScrollRight = true;

  private categoryIcons: { [key: string]: string } = {
    'tecnologia': '💻',
    'construccion': '🏗️',
    'servicios-del-hogar': '🏠',
    'salud-y-bienestar': '⚕️',
    'educacion': '📚',
    'eventos': '🎉',
    'transporte-logistica': '🚚',
    'finanzas-contabilidad': '💼',
    'marketing-publicidad': '📢',
    'asesorias-legales': '⚖️',
    'belleza-estetica': '💄',
    'gastronomia-catering': '🍽️',
  };

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollButtons(), 100);
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.categories$.subscribe({
      next: (categories) => {
        // Solo categorías de nivel 1
        this.categories = categories.filter(cat => cat.level === 1);
        this.isLoading = false;
        setTimeout(() => this.updateScrollButtons(), 100);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading = false;
      }
    });
  }

  getCategoryIcon(category: CategoryNode): string {
    return this.categoryIcons[category.slug] || '📋';
  }

  navigateToCategory(category: CategoryNode): void {
    this.router.navigate(['/categories'], {
      state: { selectedCategoryId: category.id }
    });
  }

  scrollLeft(): void {
    const container = this.carouselContainer.nativeElement;
    container.scrollBy({ left: -400, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 300);
  }

  scrollRight(): void {
    const container = this.carouselContainer.nativeElement;
    container.scrollBy({ left: 400, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 300);
  }

  updateScrollButtons(): void {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    this.canScrollLeft = container.scrollLeft > 0;
    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
  }

  onScroll(): void {
    this.updateScrollButtons();
  }
}
