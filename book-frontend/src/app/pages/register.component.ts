import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-4">
              <div class="text-center mb-4">
                <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
                <h2>Registrera Dig</h2>
                <p class="text-muted">Skapa ditt nya konto</p>
              </div>

              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-user me-2"></i>Användarnamn
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="username"
                    [class.is-invalid]="username?.invalid && username?.touched"
                    placeholder="Välj ett användarnamn"
                  >
                  <div class="invalid-feedback" *ngIf="username?.invalid && username?.touched">
                    <div *ngIf="username?.errors?.['required']">Användarnamn är obligatoriskt</div>
                    <div *ngIf="username?.errors?.['minlength']">Minst 3 tecken krävs</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-envelope me-2"></i>E-post
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    formControlName="email"
                    [class.is-invalid]="email?.invalid && email?.touched"
                    placeholder="din@email.com"
                  >
                  <div class="invalid-feedback" *ngIf="email?.invalid && email?.touched">
                    <div *ngIf="email?.errors?.['required']">E-post är obligatorisk</div>
                    <div *ngIf="email?.errors?.['email']">Ange en giltig e-postadress</div>
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
                    placeholder="Skapa ett lösenord"
                  >
                  <div class="invalid-feedback" *ngIf="password?.invalid && password?.touched">
                    <div *ngIf="password?.errors?.['required']">Lösenord är obligatoriskt</div>
                    <div *ngIf="password?.errors?.['minlength']">Minst 6 tecken krävs</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-lock me-2"></i>Bekräfta Lösenord
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    formControlName="confirmPassword"
                    [class.is-invalid]="confirmPassword?.invalid && confirmPassword?.touched"
                    placeholder="Upprepa lösenordet"
                  >
                  <div class="invalid-feedback" *ngIf="confirmPassword?.invalid && confirmPassword?.touched">
                    <div *ngIf="confirmPassword?.errors?.['required']">Bekräftelse är obligatorisk</div>
                    <div *ngIf="confirmPassword?.errors?.['passwordMismatch']">Lösenorden matchar inte</div>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="registerForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="fas fa-user-plus me-2" *ngIf="!isLoading"></i>
                  {{ isLoading ? 'Registrerar...' : 'Registrera Dig' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Har du redan ett konto? 
                    <a routerLink="/login" class="text-decoration-none">Logga in här</a>
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          if (error.status === 400) {
            this.errorMessage = 'Användarnamnet eller e-postadressen används redan.';
          } else if (error.status === 0) {
            this.errorMessage = 'Kunde inte ansluta till servern. Kontrollera att API:et körs.';
          } else {
            this.errorMessage = 'Ett fel uppstod vid registrering. Försök igen.';
          }
        }
      });
    }
  }

  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
