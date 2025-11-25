import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote, QuoteDto } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = 'http://localhost:5156/api/quotes';

  constructor(
    private http: HttpClient
  ) {}

  getQuotes(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.apiUrl);
  }

  getQuote(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/${id}`);
  }

  createQuote(quote: QuoteDto): Observable<Quote> {
    return this.http.post<Quote>(this.apiUrl, quote);
  }

  updateQuote(id: number, quote: QuoteDto): Observable<Quote> {
    return this.http.put<Quote>(`${this.apiUrl}/${id}`, quote);
  }

  deleteQuote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
