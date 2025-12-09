import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(this.getStoredTheme());
  
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.applyTheme(this.isDarkTheme.value);
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    this.applyTheme(newTheme);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkTheme', newTheme.toString());
    }
  }

  private getStoredTheme(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('darkTheme');
      return stored ? JSON.parse(stored) : false;
    }
    return false; // Default to light theme on server
  }

  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }
}
