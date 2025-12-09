import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuoteService } from '../services/quote.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Quote } from '../models/quote.model';
import { Subscription } from 'rxjs';

// Main quotes component - handles CRUD operations for user quotes
@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `

    <nav class="navbar navbar-expand-lg navbar-dark bg-success" style="background-color: #198754 !important; color: white !important;">
      <div class="container-fluid" 
           style="background-color: #198754 !important;">
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
            <i class="fas fa-sign-out-alt me-1"></i>Logga ut
          </button>
        </div>
      </div>
    </nav>

    <div class="container my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6">
          <i class="fas fa-quote-left me-2 text-success"></i>Mina Citat
        </h1>
        <button class="btn btn-success" (click)="showAddForm()" *ngIf="!showForm">
          <i class="fas fa-plus me-1"></i>Lägg till Citat
        </button>
      </div>

      <!-- Add/Edit Quote Form -->
      <div class="card mb-4" *ngIf="showForm">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">
            <i class="fas fa-quote-left me-2"></i>
            {{ editingQuote ? 'Redigera Citat' : 'Lägg till Nytt Citat' }}
          </h5>
        </div>
        <div class="card-body">
          <form [formGroup]="quoteForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Citat *</label>
              <textarea
                class="form-control"
                rows="3"
                formControlName="text"
                [class.is-invalid]="text?.invalid && text?.touched"
                placeholder="Ange citatet här..."
              ></textarea>
              <div class="invalid-feedback" *ngIf="text?.invalid && text?.touched">
                <div *ngIf="text?.errors?.['required']">Citat är obligatoriskt</div>
                <div *ngIf="text?.errors?.['minlength']">Citatet måste vara minst 10 tecken långt</div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Författare *</label>
              <input
                type="text"
                class="form-control"
                formControlName="author"
                [class.is-invalid]="author?.invalid && author?.touched"
                placeholder="Vem sa detta?"
              >
              <div class="invalid-feedback" *ngIf="author?.invalid && author?.touched">
                <div *ngIf="author?.errors?.['required']">Författare är obligatoriskt</div>
                <div *ngIf="author?.errors?.['minlength']">Minst 2 tecken krävs</div>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-success" [disabled]="quoteForm.invalid || isSaving">
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                <i class="fas fa-save me-1" *ngIf="!isSaving"></i>
                {{ isSaving ? 'Sparar...' : (editingQuote ? 'Uppdatera' : 'Spara') }}
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
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Laddar citat...</span>
        </div>
        <p class="text-muted mt-3">Laddar dina citat... (Debug: isLoading = {{isLoading}}, quotes.length = {{quotes.length}})</p>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="!isLoading && quotes.length === 0 && !showForm">
        <i class="fas fa-quote-left fa-4x text-muted mb-3"></i>
        <h3 class="text-muted">Inga citat ännu</h3>
        <p class="text-muted mb-4">Börja med att lägga till ditt första favoritcitat!</p>
        <button class="btn btn-success" (click)="showAddForm()">
          <i class="fas fa-plus me-1"></i>Lägg till ditt första citat
        </button>
      </div>

      <!-- Quotes List -->
      <div class="row" *ngIf="!isLoading && quotes.length > 0">
        <div class="col-lg-6 mb-4" *ngFor="let quote of quotes">
          <div class="card h-100 quote-card">
            <div class="card-body">
              <blockquote class="blockquote mb-3">
                <p class="quote-text">
                  <i class="fas fa-quote-left text-success me-2"></i>
                  {{ quote.text }}
                  <i class="fas fa-quote-right text-success ms-2"></i>
                </p>
              </blockquote>
              <footer class="blockquote-footer">
                <cite>
                  <i class="fas fa-user me-1"></i>{{ quote.author }}
                </cite>
              </footer>
            </div>
            <div class="card-footer bg-transparent border-top">
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-outline-success btn-sm flex-fill"
                  (click)="editQuote(quote)"
                >
                  <i class="fas fa-edit me-1"></i>Redigera
                </button>
                <button 
                  class="btn btn-outline-danger btn-sm flex-fill"
                  (click)="quote.id && deleteQuote(quote.id)"
                >
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
    .quote-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: none;
      border-left: 4px solid #28a745;
    }

    .quote-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }

    .quote-text {
      font-style: italic;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 0;
    }

    .blockquote-footer {
      font-size: 0.875rem;
      margin-top: 1rem;
    }

    .card-footer {
      padding: 0.75rem 1rem;
    }

    .card-footer .btn {
      font-size: 0.8rem;
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

      .quote-card .card-footer .d-flex {
        flex-direction: column;
      }

      .quote-card .card-footer .btn {
        margin-bottom: 0.5rem;
      }

      .quote-card .card-footer .btn:last-child {
        margin-bottom: 0;
      }

      /* Dark theme adjustments for mobile */
      .dark-theme .d-flex.gap-2 .btn-outline-secondary {
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.15);
      }
    }
  `]
})
export class QuotesComponent implements OnInit, OnDestroy {
  quotes: Quote[] = [];
  quoteForm: FormGroup;
  editingQuote: Quote | null = null;
  showForm = false;
  isSaving = false;
  isDarkTheme = false;
  isLoading = false;
  private authSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private quoteService: QuoteService,
    private authService: AuthService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.quoteForm = this.fb.group({
      text: ['', [Validators.required]],
      author: ['', [Validators.required]]
    });
  }
  get text() { return this.quoteForm.get('text'); }
  get author() { return this.quoteForm.get('author'); }
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
    
    this.loadQuotes();
    
    this.authSubscription = this.authService.token$.subscribe(token => {
      if (token && this.quotes.length === 0) {
        this.loadQuotes();
      }
    });
  }

  loadQuotes(): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, skipping quotes load');
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('Loading quotes...');
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.quoteService.getQuotes().subscribe({
      next: (quotes) => {
        console.log('Quotes loaded successfully:', quotes);
        this.quotes = quotes || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        this.isLoading = false;
        this.quotes = [];
        this.cdr.detectChanges();
      }
    });
  }

  showAddForm(): void {
    this.showForm = true;
    this.editingQuote = null;
    this.quoteForm.reset();
  }

  editQuote(quote: Quote): void {
    this.editingQuote = quote;
    this.showForm = true;
    this.quoteForm.patchValue({
      text: quote.text,
      author: quote.author
    });
  }

  // Handles form submission for creating and updating quotes
  onSubmit(): void {
    if (this.quoteForm.valid && !this.isSaving) {
      this.isSaving = true;
      const quoteData = this.quoteForm.value;

      if (this.editingQuote) {
        this.quoteService.updateQuote(this.editingQuote.id!, quoteData).subscribe({
          next: (updatedQuote) => {
            console.log('Quote update response:', updatedQuote);
            const index = this.quotes.findIndex(q => q.id === this.editingQuote!.id);
            if (index !== -1) {
              this.quotes[index] = updatedQuote;
              console.log('Updated quote at index:', index, this.quotes[index]);
            }
            this.cancelEdit();
            this.isSaving = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error updating quote:', error);
            this.isSaving = false;
          }
        });
      } else {
        this.quoteService.createQuote(quoteData).subscribe({
          next: (newQuote) => {
            this.quotes.push(newQuote);
            this.cancelEdit();
            this.isSaving = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error creating quote:', error);
            this.isSaving = false;
          }
        });
      }
    }
  }

  // Deletes a quote after user confirmation
  deleteQuote(id: number): void {
    if (confirm('Är du säker på att du vill radera detta citat?')) {
      this.quoteService.deleteQuote(id).subscribe({
        next: () => {
          console.log(`Quote ${id} deleted successfully`);
          this.quotes = this.quotes.filter(quote => quote.id !== id);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting quote:', error);
        }
      });
    }
  }

  // Cancels the current edit operation
  cancelEdit(): void {
    this.showForm = false;
    this.editingQuote = null;
    this.quoteForm.reset();
  }

  // Navigates back to the home page
  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  // Toggles between light and dark themes
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Logs out the current user and redirects to login page
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Component cleanup - unsubscribes from observables to prevent memory leaks
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}
