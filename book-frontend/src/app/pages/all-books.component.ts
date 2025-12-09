import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-all-books',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary" style="background-color: #0d6efd !important; color: white !important;">
      <div class="container-fluid" 
           style="background-color: #0d6efd !important;">
        <a class="navbar-brand" href="#" (click)="navigateHome()" style="color: white !important;">
          <i class="fas fa-book me-2" style="color: white !important;"></i>Book Manager
        </a>
        
        <div class="navbar-nav ms-auto">
          <a class="nav-link" routerLink="/books" routerLinkActive="active" style="color: white !important;">
            <i class="fas fa-book me-1" style="color: white !important;"></i>Mina Böcker
          </a>
          <a class="nav-link" routerLink="/all-books" routerLinkActive="active" style="color: white !important;">
            <i class="fas fa-library me-1" style="color: white !important;"></i>Alla Böcker
          </a>
          <a class="nav-link" routerLink="/quotes" routerLinkActive="active" style="color: white !important;">
            <i class="fas fa-quote-left me-1" style="color: white !important;"></i>Mina Citat
          </a>
          <a class="nav-link" routerLink="/all-quotes" routerLinkActive="active" style="color: white !important;">
            <i class="fas fa-quote-right me-1" style="color: white !important;"></i>Alla Citat
          </a>
          <button class="btn btn-outline-light btn-sm ms-2" (click)="toggleTheme()" style="color: white !important; border-color: white !important;">
            <i [class]="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'" style="color: white !important;"></i>
          </button>
          <button class="btn btn-outline-light btn-sm ms-2" (click)="logout()" style="color: white !important; border-color: white !important;">
            <i class="fas fa-sign-out-alt me-1" style="color: white !important;"></i>Logga ut
          </button>
        </div>
      </div>
    </nav>

    <div class="container my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6">
          <i class="fas fa-library me-2 text-primary"></i>Alla Böcker i Biblioteket
        </h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" (click)="refreshBooks()" [disabled]="isLoading">
            <i class="fas fa-sync me-1" [class.fa-spin]="isLoading"></i>Uppdatera
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="text-center py-5" *ngIf="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Laddar böcker...</span>
        </div>
        <p class="text-muted mt-3">Laddar alla böcker...</p>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="!isLoading && allBooks.length === 0">
        <i class="fas fa-library fa-4x text-muted mb-3"></i>
        <h3 class="text-muted">Inga böcker i biblioteket</h3>
        <p class="text-muted mb-4">Biblioteket är tomt. Lägg till böcker i dina personliga böcker för att fylla biblioteket!</p>
      </div>

      <!-- Books Grid -->
      <div class="row" *ngIf="!isLoading && allBooks.length > 0">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let book of allBooks">
          <div class="card h-100 shadow-sm book-card">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-primary">{{ book.title }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">
                <i class="fas fa-user me-1"></i>{{ book.author }}
              </h6>
              
              <div class="book-details mb-3 flex-grow-1">
                <p class="text-muted mb-1" *ngIf="book.genre">
                  <i class="fas fa-tag me-1"></i>{{ book.genre }}
                </p>
                <p class="text-muted mb-1">
                  <i class="fas fa-calendar me-1"></i>{{ formatDate(book.publishedDate) }}
                </p>
                <p class="text-muted mb-1" *ngIf="book.isbn">
                  <i class="fas fa-barcode me-1"></i>{{ book.isbn }}
                </p>
                <p class="text-muted mb-1">
                  <i class="fas fa-user-plus me-1"></i>Tillagd av: {{ book.addedBy }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      border: none;
      border-left: 4px solid var(--bs-primary);
    }

    .book-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .book-details {
      font-size: 0.9rem;
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

    .form-control {
      border-radius: 6px;
    }
  `]
})
export class AllBooksComponent implements OnInit {
  allBooks: any[] = [];
  uniqueGenres: string[] = [];
  isLoading = true;
  isDarkTheme = false;

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    console.log('AllBooksComponent initialized');
    
    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
    
    this.loadAllBooks();
  }

  loadAllBooks(): void {
    console.log('Starting to load all books...');
    this.isLoading = true;
    this.allBooks = []; // Reset books array
    
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        console.log('Books loaded successfully:', books);
        console.log('Number of books received:', books?.length || 0);
        console.log('Sample book data:', books?.[0] || 'No books');
        
        setTimeout(() => {
          this.allBooks = books || [];
          this.extractUniqueGenres();
          this.isLoading = false;
          
          console.log('Component state after loading:', {
            isLoading: this.isLoading,
            booksCount: this.allBooks.length,
            books: this.allBooks
          });
          
          // Force Angular to detect changes
          this.cdr.markForCheck();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        setTimeout(() => {
          this.allBooks = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  refreshBooks(): void {
    this.loadAllBooks();
  }

  extractUniqueGenres(): void {
    const genres = this.allBooks
      .map(book => book.genre)
      .filter(genre => genre && genre.trim() !== '')
      .filter((genre, index, array) => array.indexOf(genre) === index)
      .sort();
    this.uniqueGenres = genres;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  }

  getUniqueContributors(): number {
    const contributors = this.allBooks
      .map(book => book.addedBy)
      .filter((contributor, index, array) => array.indexOf(contributor) === index);
    return contributors.length;
  }

  getMostRecentYear(): number {
    if (this.allBooks.length === 0) return new Date().getFullYear();
    const years = this.allBooks
      .map(book => new Date(book.publishedDate).getFullYear())
      .filter(year => !isNaN(year));
    return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
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
