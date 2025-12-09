import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Book } from '../models/book.model';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
          <button class="btn btn-outline-light btn-sm ms-2" (click)="logout()">
            <i class="fas fa-sign-out-alt me-1"></i>Logga ut
          </button>
        </div>
      </div>
    </nav>

    <div class="container my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6">
          <i class="fas fa-book me-2 text-primary"></i>Mina Böcker
        </h1>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" (click)="showAddForm()" *ngIf="!showForm">
            <i class="fas fa-plus me-1"></i>Lägg till Bok
          </button>
          <button class="btn btn-outline-secondary" (click)="refreshBooks()" [disabled]="isLoading">
            <i class="fas fa-sync me-1" [class.fa-spin]="isLoading"></i>Uppdatera
          </button>
        </div>
      </div>

      <!-- Add/Edit Book Form -->
      <div class="card mb-4" *ngIf="showForm">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-book me-2"></i>
            {{ editingBook ? 'Redigera Bok' : 'Lägg till Ny Bok' }}
          </h5>
        </div>
        <div class="card-body">
          <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Titel *</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="title"
                  placeholder="Bokens titel"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Författare *</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="author"
                  placeholder="Författarens namn"
                >
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Publiceringsdatum *</label>
                <input
                  type="date"
                  class="form-control"
                  formControlName="publishedDate"
                >
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Genre</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="genre"
                  placeholder="t.ex. Fantasy, Romantik"
                >
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">ISBN</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="isbn"
                  placeholder="978-3-16-148410-0"
                >
              </div>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" [disabled]="bookForm.invalid || isSaving">
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                <i class="fas fa-save me-1" *ngIf="!isSaving"></i>
                {{ isSaving ? 'Sparar...' : (editingBook ? 'Uppdatera' : 'Spara') }}
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="cancelEdit()">
                <i class="fas fa-times me-1"></i>Avbryt
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading State -->
      <div class="text-center py-5" *ngIf="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Laddar böcker...</span>
        </div>
        <p class="text-muted mt-3">Laddar dina böcker...</p>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="!isLoading && books.length === 0 && !showForm">
        <i class="fas fa-book fa-4x text-muted mb-3"></i>
        <h3 class="text-muted">Inga böcker ännu</h3>
        <p class="text-muted mb-4">Börja med att lägga till din första bok!</p>
        <button class="btn btn-primary" (click)="showAddForm()">
          <i class="fas fa-plus me-1"></i>Lägg till din första bok
        </button>
      </div>

      <!-- Books Grid -->
      <div class="row" *ngIf="!isLoading && books && books.length > 0">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let book of books">
          <div class="card h-100 shadow-sm book-card">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-primary">{{ book.title }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">
                <i class="fas fa-user me-1"></i>{{ book.author }}
              </h6>
              
              <div class="book-info flex-grow-1">
                <p class="text-muted mb-1">
                  <i class="fas fa-calendar me-1"></i>
                  Publicerad: {{ formatDate(book.publishedDate) }}
                </p>
                <p class="text-muted mb-1" *ngIf="book.genre">
                  <i class="fas fa-tag me-1"></i>
                  Genre: {{ book.genre }}
                </p>
                <p class="text-muted mb-0" *ngIf="book.isbn">
                  <i class="fas fa-barcode me-1"></i>
                  ISBN: {{ book.isbn }}
                </p>
              </div>

              <div class="card-actions mt-3 d-flex gap-2">
                <button (click)="editBook(book)" class="btn btn-outline-primary btn-sm flex-fill">
                  <i class="fas fa-edit me-1"></i>Redigera
                </button>
                <button (click)="book.id && deleteBook(book.id)" class="btn btn-outline-danger btn-sm flex-fill">
                  <i class="fas fa-trash me-1"></i>Radera
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: none;
    }

    .book-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .card-subtitle {
      font-size: 0.9rem;
    }

    .book-info {
      font-size: 0.85rem;
    }

    .card-actions .btn {
      font-size: 0.85rem;
      padding: 0.4rem 0.8rem;
    }

    .navbar-brand:hover {
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .d-flex.justify-content-between {
        flex-wrap: nowrap;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0;
      }

      .d-flex.justify-content-between h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0;
        flex: 1 1 auto;
        min-width: 0; /* Allow text truncation if needed */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .d-flex.justify-content-between h1 i {
        font-size: 1.1rem;
        margin-right: 0.4rem;
      }

      .d-flex.gap-2 {
        flex: 0 0 auto;
        gap: 0.4rem !important;
        display: flex;
        flex-wrap: nowrap;
      }

      .d-flex.gap-2 .btn {
        font-size: 0.7rem;
        font-weight: 500;
        padding: 0.4rem 0.6rem;
        border-radius: 0.375rem;
        white-space: nowrap;
        min-width: auto;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      .d-flex.gap-2 .btn-primary {
        background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
        border: none;
      }

      .d-flex.gap-2 .btn-outline-secondary {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
      }

      .d-flex.gap-2 .btn i {
        font-size: 0.65rem;
        margin-right: 0.3rem;
      }

      .card-actions {
        flex-direction: column !important;
      }

      /* Dark theme adjustments for mobile */
      .dark-theme .d-flex.gap-2 .btn-outline-secondary {
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.15);
      }
    }
  `]
})
export class BooksComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  bookForm: FormGroup;
  editingBook: Book | null = null;
  showForm = false;
  isSaving = false;
  isDarkTheme = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      publishedDate: ['', Validators.required],
      genre: [''],
      isbn: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
    
    // Load books immediately
    this.loadBooks();
  }

  loadBooks(): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, skipping book load');
      this.isLoading = false;
      return;
    }
    
    console.log('Loading books...');
    this.isLoading = true;
    
    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('Books API response received:', books);
        console.log('Books type:', typeof books);
        console.log('Books is array:', Array.isArray(books));
        
        // Set the books array
        this.books = Array.isArray(books) ? books : [];
        this.isLoading = false;
        
        // Force change detection
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
        
        console.log('Final books array:', this.books);
        console.log('Final isLoading state:', this.isLoading);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading = false;
        this.books = [];
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  showAddForm(): void {
    this.showForm = true;
    this.editingBook = null;
    this.bookForm.reset();
  }

  editBook(book: Book): void {
    this.editingBook = book;
    this.showForm = true;
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      publishedDate: book.publishedDate,
      genre: book.genre || '',
      isbn: book.isbn || ''
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid && !this.isSaving) {
      this.isSaving = true;
      const bookData = this.bookForm.value;

      if (this.editingBook) {
        // Update existing book - include the ID in the book data
        const updatedBookData = { ...bookData, id: this.editingBook.id };
        this.bookService.updateBook(this.editingBook.id!, updatedBookData).subscribe({
          next: (updatedBook) => {
            const index = this.books.findIndex(b => b.id === this.editingBook!.id);
            this.books[index] = updatedBook;
            this.cancelEdit();
            this.isSaving = false;
            this.cdr.detectChanges(); // Force change detection
          },
          error: (error) => {
            console.error('Error updating book:', error);
            this.isSaving = false;
          }
        });
      } else {
        // Add new book
        this.bookService.createBook(bookData).subscribe({
          next: (newBook) => {
            this.books.push(newBook);
            this.cancelEdit();
            this.isSaving = false;
            this.cdr.detectChanges(); // Force change detection
          },
          error: (error) => {
            console.error('Error creating book:', error);
            this.isSaving = false;
          }
        });
      }
    }
  }

  deleteBook(id: number): void {
    if (confirm('Är du säker på att du vill radera denna bok?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          console.log(`Book ${id} deleted successfully`);
          this.books = this.books.filter(book => book.id !== id);
          this.cdr.detectChanges(); // Force change detection
          
          // Optional: Reload from server to ensure consistency
          // this.loadBooks();
        },
        error: (error) => {
          console.error('Error deleting book:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingBook = null;
    this.bookForm.reset();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('sv-SE');
  }

  refreshBooks(): void {
    console.log('Manual refresh triggered');
    this.loadBooks();
  }

  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
