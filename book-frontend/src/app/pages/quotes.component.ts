// Import necessary Angular modules and services
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor directives
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // For form handling
import { Router, RouterModule } from '@angular/router'; // For navigation
import { QuoteService } from '../services/quote.service'; // API service for quote operations
import { AuthService } from '../services/auth.service'; // Authentication service
import { Quote } from '../models/quote.model'; // Quote data model
import { Subscription } from 'rxjs'; // For managing observables

// Main quotes component - handles CRUD operations for user quotes
@Component({
  selector: 'app-quotes', // Component selector for HTML usage
  standalone: true, // New Angular standalone component architecture
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Required modules
  template: `
    <!-- Top navigation bar with success theme -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <a class="navbar-brand" href="#" (click)="navigateHome()">
          <i class="fas fa-quote-left me-2"></i>Quote Manager
        </a>
        
        <div class="navbar-nav ms-auto">
          <a class="nav-link" routerLink="/books" routerLinkActive="active">
            <i class="fas fa-book me-1"></i>Böcker
          </a>
          <a class="nav-link" routerLink="/quotes" routerLinkActive="active">
            <i class="fas fa-quote-left me-1"></i>Mina Citat
          </a>
          <button class="btn btn-outline-light btn-sm ms-2" (click)="toggleTheme()">
            <i [class]="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'"></i>
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
  // Array to store all user quotes loaded from API
  quotes: Quote[] = [];
  
  // Reactive form for adding/editing quotes with validation
  quoteForm: FormGroup;
  
  // Currently selected quote for editing (null for new quotes)
  editingQuote: Quote | null = null;
  
  // Controls visibility of the add/edit form
  showForm = false;
  
  // Loading state for save operations to prevent double-submission
  isSaving = false;
  
  // Theme toggle state for light/dark mode
  isDarkTheme = false;
  
  // Loading state for initial quotes fetch
  isLoading = false;
  
  // Subscription to auth state changes for cleanup
  private authSubscription?: Subscription;

  /**
   * Constructor - Inject dependencies and initialize the reactive form
   * Sets up form validation rules for quote text and author fields
   */
  constructor(
    private fb: FormBuilder, // For creating reactive forms
    private router: Router, // For navigation between routes
    private quoteService: QuoteService, // API service for quote CRUD operations
    private authService: AuthService, // Authentication and token management
    private cdr: ChangeDetectorRef // For manual change detection when needed
  ) {
    // Initialize reactive form with validation rules
    this.quoteForm = this.fb.group({
      text: ['', [Validators.required]], // Quote text is required
      author: ['', [Validators.required]] // Author name is required
    });
  }

  // Getter methods for easy access to form controls in template
  get text() { return this.quoteForm.get('text'); }
  get author() { return this.quoteForm.get('author'); }

  /**
   * Component initialization - runs after constructor
   * Verifies user authentication and loads quotes data
   * Sets up subscription to auth state changes for session persistence
   */
  ngOnInit(): void {
    // Check if user is authenticated - redirect to login if not
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Load quotes immediately and also listen for auth state changes
    this.loadQuotes();
    
    // Subscribe to auth state changes to reload data when user logs in
    // This helps maintain data consistency across browser refreshes
    this.authSubscription = this.authService.token$.subscribe(token => {
      if (token && this.quotes.length === 0) {
        this.loadQuotes();
      }
    });
  }

  /**
   * Loads user's quotes from the API
   * Includes proper error handling and loading states
   * Uses ChangeDetectorRef to ensure UI updates properly
   */
  loadQuotes(): void {
    // Double-check authentication before making API call
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, skipping quotes load');
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('Loading quotes...');
    this.isLoading = true;
    this.cdr.detectChanges(); // Ensure loading spinner shows immediately
    
    // Make API call to fetch user's quotes
    this.quoteService.getQuotes().subscribe({
      next: (quotes) => {
        console.log('Quotes loaded successfully:', quotes);
        this.quotes = quotes || []; // Handle null/undefined response
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        this.isLoading = false;
        this.quotes = []; // Clear quotes on error
        this.cdr.detectChanges(); // Ensure error state is reflected in UI
      }
    });
  }

  /**
   * Shows the form for adding a new quote
   * Resets form state and clears any existing edit data
   */
  showAddForm(): void {
    this.showForm = true;
    this.editingQuote = null; // Clear edit mode
    this.quoteForm.reset(); // Clear form fields
  }

  /**
   * Prepares form for editing an existing quote
   * Populates form fields with current quote data
   */
  editQuote(quote: Quote): void {
    this.editingQuote = quote; // Set edit mode
    this.showForm = true; // Show the form
    // Populate form with existing quote data
    this.quoteForm.patchValue({
      text: quote.text,
      author: quote.author
    });
  }

  /**
   * Handles form submission for both creating and updating quotes
   * Includes validation, loading states, and proper error handling
   * Updates local array and forces change detection for immediate UI updates
   */
  onSubmit(): void {
    // Only proceed if form is valid and not already saving
    if (this.quoteForm.valid && !this.isSaving) {
      this.isSaving = true; // Prevent double-submission
      const quoteData = this.quoteForm.value;

      if (this.editingQuote) {
        // Update existing quote via API
        this.quoteService.updateQuote(this.editingQuote.id!, quoteData).subscribe({
          next: (updatedQuote) => {
            console.log('Quote update response:', updatedQuote);
            // Find and update the quote in local array for immediate UI update
            const index = this.quotes.findIndex(q => q.id === this.editingQuote!.id);
            if (index !== -1) {
              this.quotes[index] = updatedQuote;
              console.log('Updated quote at index:', index, this.quotes[index]);
            }
            this.cancelEdit();
            this.isSaving = false;
            this.cdr.detectChanges(); // Force UI update to show changes immediately
          },
          error: (error) => {
            console.error('Error updating quote:', error);
            this.isSaving = false; // Re-enable form submission
          }
        });
      } else {
        // Create new quote via API
        this.quoteService.createQuote(quoteData).subscribe({
          next: (newQuote) => {
            this.quotes.push(newQuote); // Add to local array for immediate UI update
            this.cancelEdit();
            this.isSaving = false;
            this.cdr.detectChanges(); // Force UI update to show new quote immediately
          },
          error: (error) => {
            console.error('Error creating quote:', error);
            this.isSaving = false; // Re-enable form submission
          }
        });
      }
    }
  }

  /**
   * Deletes a quote after user confirmation
   * Updates local array immediately for responsive UI
   */
  deleteQuote(id: number): void {
    // Show Swedish confirmation dialog
    if (confirm('Är du säker på att du vill radera detta citat?')) {
      this.quoteService.deleteQuote(id).subscribe({
        next: () => {
          console.log(`Quote ${id} deleted successfully`);
          // Remove from local array for immediate UI update
          this.quotes = this.quotes.filter(quote => quote.id !== id);
          this.cdr.detectChanges(); // Force change detection to update UI
        },
        error: (error) => {
          console.error('Error deleting quote:', error);
          // Could add user-friendly error message here
        }
      });
    }
  }

  /**
   * Cancels the current edit operation
   * Hides form and resets all form-related state
   */
  cancelEdit(): void {
    this.showForm = false; // Hide the form
    this.editingQuote = null; // Clear edit mode
    this.quoteForm.reset(); // Clear form fields and validation states
  }

  /**
   * Navigates back to the home page
   * Used by the navbar brand click handler
   */
  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Toggles between light and dark themes
   * Applies theme class to document body for global styling
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    // Apply CSS class to body for theme-specific styling
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  /**
   * Logs out the current user and redirects to login page
   * Clears authentication tokens and session data
   */
  logout(): void {
    this.authService.logout(); // Clear tokens and user data
    this.router.navigate(['/login']); // Redirect to login page
  }

  /**
   * Component cleanup - runs when component is destroyed
   * Unsubscribes from observables to prevent memory leaks
   * Essential for proper resource management in Angular applications
   */
  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    this.authSubscription?.unsubscribe();
  }
}
