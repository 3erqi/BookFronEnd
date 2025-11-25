import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { BooksComponent } from './pages/books.component';
import { QuotesComponent } from './pages/quotes.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'books', component: BooksComponent, canActivate: [AuthGuard] },
  { path: 'quotes', component: QuotesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/' }
];
