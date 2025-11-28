import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CategoryNode, CategoriesResponse } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private categoriesCache = new BehaviorSubject<CategoryNode[]>([]);
  public categories$ = this.categoriesCache.asObservable();

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.getCategories().subscribe({
      next: (categories) => {
        this.categoriesCache.next(categories);
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }


  getCategories(): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(`${this.apiUrl}/tree`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  getCategoryBySlug(slug: string): Observable<CategoryNode | undefined> {
    return this.categories$.pipe(
      map(categories => this.findCategoryBySlug(categories, slug))
    );
  }

  private findCategoryBySlug(categories: CategoryNode[], slug: string): CategoryNode | undefined {
    for (const category of categories) {
      if (category.slug === slug) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = this.findCategoryBySlug(category.children, slug);
        if (found) return found;
      }
    }
    return undefined;
  }

  getTopCategories(): Observable<CategoryNode[]> {
    return this.categories$.pipe(
      map(categories => categories.filter(cat => cat.isTop))
    );
  }


  getFullHierarchy(includeInactive: boolean = false): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/hierarchy?includeInactive=${includeInactive}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }


  getLevel1Categories(includeInactive: boolean = false): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/level1?includeInactive=${includeInactive}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }

  getLevel2CategoriesByParent(parentId: number, includeInactive: boolean = false): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/${parentId}/level2?includeInactive=${includeInactive}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }


  getLevel3CategoriesByParent(parentId: number, includeInactive: boolean = false): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/${parentId}/level3?includeInactive=${includeInactive}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }

  getCategoriesByLevel(level: 1 | 2 | 3, includeInactive: boolean = false): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/level/${level}?includeInactive=${includeInactive}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }


  getSubcategories(parentId: number, includeInactive: boolean = false): Observable<CategoryNode[]> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/${parentId}/subcategories?includeInactive=${includeInactive}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }


  getCategoryById(categoryId: number, includeChildren: boolean = true): Observable<CategoryNode> {
    return this.http.get<{ success: boolean; data: CategoryNode }>(
      `${this.apiUrl}/${categoryId}?includeChildren=${includeChildren}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }
}
