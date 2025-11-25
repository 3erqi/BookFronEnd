import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'Book & Quote Manager';
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Initialize authentication state from localStorage
    this.authService.initializeAuth();
    
    // Wait a bit for auth initialization, then handle initial navigation
    setTimeout(() => {
      if (this.authService.isAuthenticated() && (this.router.url === '/' || this.router.url === '/home')) {
        this.router.navigate(['/books']);
      }
    }, 50);
    
    // Subscribe to auth state changes to handle navigation
    this.authService.token$.subscribe(token => {
      if (token && (this.router.url === '/' || this.router.url === '/home')) {
        this.router.navigate(['/books']);
      }
    });
  }
}
