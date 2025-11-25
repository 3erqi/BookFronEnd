import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h1 class="text-center">Book & Quote Manager</h1>
            </div>
            <div class="card-body">
              <p class="lead text-center">Välkommen till din bok- och citathanterings applikation!</p>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                      <i class="fas fa-book fa-3x mb-3"></i>
                      <h4>Hantera Böcker</h4>
                      <p>Lägg till, redigera och organisera dina böcker</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="card bg-success text-white">
                    <div class="card-body text-center">
                      <i class="fas fa-quote-left fa-3x mb-3"></i>
                      <h4>Mina Citat</h4>
                      <p>Samla och hantera dina favoritcitat</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 class="mt-4">Demo Inloggning</h3>
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Användarnamn</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      formControlName="username"
                      placeholder="Ange användarnamn"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Lösenord</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      formControlName="password"
                      placeholder="Ange lösenord"
                    >
                  </div>
                </div>
                
                <div class="alert alert-info" *ngIf="message">
                  {{ message }}
                </div>
                
                <div class="d-flex gap-2 flex-wrap">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Processar...' : 'Testa Inloggning' }}
                  </button>
                  
                  <a routerLink="/login" class="btn btn-outline-primary">
                    <i class="fas fa-sign-in-alt me-2"></i>Gå till Inloggning
                  </a>
                  
                  <a routerLink="/register" class="btn btn-outline-success">
                    <i class="fas fa-user-plus me-2"></i>Registrera dig
                  </a>
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
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .bg-primary, .bg-success {
      background: linear-gradient(135deg, var(--bs-primary), var(--bs-info)) !important;
    }
    .bg-success {
      background: linear-gradient(135deg, var(--bs-success), var(--bs-teal)) !important;
    }
  `]
})
export class HomeComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // If already authenticated, redirect to books
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/books']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.message = '';
      
      setTimeout(() => {
        const { username, password } = this.loginForm.value;
        this.message = `Inloggning testad med användarnamn: ${username}`;
        this.isLoading = false;
        console.log('Login test:', { username, password });
      }, 1000);
    }
  }
}
