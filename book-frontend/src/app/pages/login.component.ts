import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <div class="text-center mb-4">
                <i class="fas fa-book fa-3x text-primary mb-3"></i>
                <h2>Logga In</h2>
                <p class="text-muted">Välkommen tillbaka!</p>
              </div>

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-user me-2"></i>Användarnamn
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="username"
                    [class.is-invalid]="username?.invalid && username?.touched"
                    placeholder="Ange ditt användarnamn"
                  >
                  <div class="invalid-feedback" *ngIf="username?.invalid && username?.touched">
                    <div *ngIf="username?.errors?.['required']">Användarnamn är obligatoriskt</div>
                    <div *ngIf="username?.errors?.['minlength']">Minst 3 tecken krävs</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-lock me-2"></i>Lösenord
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    formControlName="password"
                    [class.is-invalid]="password?.invalid && password?.touched"
                    placeholder="Ange ditt lösenord"
                  >
                  <div class="invalid-feedback" *ngIf="password?.invalid && password?.touched">
                    <div *ngIf="password?.errors?.['required']">Lösenord är obligatoriskt</div>
                    <div *ngIf="password?.errors?.['minlength']">Minst 6 tecken krävs</div>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="loginForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="fas fa-sign-in-alt me-2" *ngIf="!isLoading"></i>
                  {{ isLoading ? 'Loggar in...' : 'Logga In' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Har du inget konto? 
                    <a routerLink="/register" class="text-decoration-none">Registrera dig här</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
    
    .form-control {
      border-radius: 10px;
      padding: 12px;
    }
    
    .btn {
      border-radius: 10px;
      padding: 12px;
    }
    
    .bg-light {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          if (error.status === 401) {
            this.errorMessage = 'Felaktigt användarnamn eller lösenord';
          } else if (error.status === 0) {
            this.errorMessage = 'Kunde inte ansluta till servern. Kontrollera att API:et körs.';
          } else {
            this.errorMessage = 'Ett fel uppstod vid inloggning. Försök igen.';
          }
        }
      });
    }
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}
