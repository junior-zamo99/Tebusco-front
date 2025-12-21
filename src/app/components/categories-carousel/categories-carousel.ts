import { Component, OnInit } from '@angular/core';
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
export class CategoriesCarouselComponent implements OnInit {
  categories: CategoryNode[] = [];
  isLoading = true;

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

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getLevel1Categories(false).subscribe({
      next: (categories) => {
        // Solo las primeras 4 categorías de nivel 1
        this.categories = categories.slice(0, 4);
        this.isLoading = false;
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
    this.router.navigate(['/categories'], { queryParams: { category: category.id }
    });
  }
}
