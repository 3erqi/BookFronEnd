import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuoteService } from '../services/quote.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-all-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary" 
         [style.background-color]="isDarkTheme ? '#21262d' : '#0d6efd'" 
         [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'"
         style="color: white !important;">
      <div class="container-fluid" 
           [style.background-color]="isDarkTheme ? '#21262d' : '#0d6efd'"
           style="background-color: #0d6efd !important;">
        <a class="navbar-brand" href="#" (click)="navigateHome()" 
           [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;">
          <i class="fas fa-book me-2" 
             [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>Book Manager
        </a>
        
        <div class="navbar-nav ms-auto">
          <a class="nav-link" routerLink="/books" routerLinkActive="active" 
             [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;">
            <i class="fas fa-book me-1" 
               [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>Mina Böcker
          </a>
          <a class="nav-link" routerLink="/all-books" routerLinkActive="active" 
             [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;">
            <i class="fas fa-library me-1" 
               [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>Alla Böcker
          </a>
          <a class="nav-link" routerLink="/quotes" routerLinkActive="active" 
             [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;">
            <i class="fas fa-quote-left me-1" 
               [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>Mina Citat
          </a>
          <a class="nav-link" routerLink="/all-quotes" routerLinkActive="active" 
             [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;">
            <i class="fas fa-quote-right me-1" 
               [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>Alla Citat
          </a>
          <button class="btn btn-outline-light btn-sm ms-2" (click)="toggleTheme()" 
                  [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'"
                  [style.border-color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important; border-color: white !important;">
            <i [class]="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'" 
               [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>
          </button>
          <button class="btn btn-outline-light btn-sm ms-2" (click)="logout()" 
                  [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'"
                  [style.border-color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important; border-color: white !important;">
            <i class="fas fa-sign-out-alt me-1" 
               [style.color]="isDarkTheme ? '#f0f6fc' : '#ffffff'" style="color: white !important;"></i>Logga ut
          </button>
        </div>
      </div>
    </nav>

    <div class="container my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6">
          <i class="fas fa-quote-right me-2 text-primary"></i>Alla Citat i Biblioteket
        </h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" (click)="refreshQuotes()" [disabled]="isLoading">
            <i class="fas fa-sync me-1" [class.fa-spin]="isLoading"></i>Uppdatera
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="text-center py-5" *ngIf="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Laddar citat...</span>
        </div>
        <p class="text-muted mt-3">Laddar alla citat...</p>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="!isLoading && allQuotes.length === 0">
        <i class="fas fa-quote-right fa-4x text-muted mb-3"></i>
        <h3 class="text-muted">Inga citat i biblioteket</h3>
        <p class="text-muted mb-4">Biblioteket är tomt. Lägg till citat i dina personliga citat för att fylla biblioteket!</p>
      </div>

      <!-- Quotes Grid -->
      <div class="row" *ngIf="!isLoading && allQuotes.length > 0">
        <div class="col-lg-6 col-md-12 mb-4" *ngFor="let quote of allQuotes">
          <div class="card h-100 shadow-sm quote-card">
            <div class="card-body d-flex flex-column">
              <blockquote class="blockquote mb-3 flex-grow-1">
                <p class="mb-0">"{{ quote.text }}"</p>
              </blockquote>
              
              <div class="quote-details mt-auto">
                <footer class="blockquote-footer mb-2">
                  <strong>{{ quote.author }}</strong>
                </footer>
                <p class="text-muted mb-0 small">
                  <i class="fas fa-user-plus me-1"></i>Tillagt av: {{ quote.addedBy }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quote-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      border: none;
      border-left: 4px solid var(--bs-primary);
    }

    .quote-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .blockquote p {
      font-style: italic;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .blockquote-footer {
      font-size: 1rem;
    }

    .navbar-brand {
      font-weight: 600;
    }

    .display-6 {
      font-weight: 300;
    }

    .card {
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    .btn {
      border-radius: 6px;
    }

    .quote-details {
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }
  `]
})
export class AllQuotesComponent implements OnInit {
  allQuotes: any[] = [];
  isLoading = true;
  isDarkTheme = false;

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private quoteService: QuoteService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    console.log('AllQuotesComponent initialized');
    
    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
    
    this.loadAllQuotes();
  }

  loadAllQuotes(): void {
    console.log('Starting to load all quotes...');
    this.isLoading = true;
    this.allQuotes = []; // Reset quotes array
    
    this.quoteService.getAllQuotes().subscribe({
      next: (quotes) => {
        console.log('Quotes loaded successfully:', quotes);
        console.log('Number of quotes received:', quotes?.length || 0);
        console.log('Sample quote data:', quotes?.[0] || 'No quotes');
        
        setTimeout(() => {
          this.allQuotes = quotes || [];
          this.isLoading = false;
          
          console.log('Component state after loading:', {
            isLoading: this.isLoading,
            quotesCount: this.allQuotes.length,
            quotes: this.allQuotes
          });
          
          // Force Angular to detect changes
          this.cdr.markForCheck();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        setTimeout(() => {
          this.allQuotes = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  refreshQuotes(): void {
    this.loadAllQuotes();
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
