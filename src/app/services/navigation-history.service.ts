import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.history.push(event.urlAfterRedirects);
    });
  }

  goBack(fallbackUrl: string = '/'): void {
    this.history.pop(); // quitar la página actual
    const previous = this.history.length > 0
      ? this.history[this.history.length - 1]
      : fallbackUrl;
    this.router.navigateByUrl(previous);
  }

  get canGoBack(): boolean {
    return this.history.length > 1;
  }
}
