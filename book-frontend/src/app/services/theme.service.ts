import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(this.getStoredTheme());
  
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    this.applyTheme(this.isDarkTheme.value);
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('darkTheme', newTheme.toString());
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem('darkTheme');
    return stored ? JSON.parse(stored) : false;
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
