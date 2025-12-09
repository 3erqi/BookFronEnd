import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'https://unsparkling-angela-clashingly.ngrok-free.dev/api/books';

  constructor(
    private http: HttpClient
  ) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  createBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  updateBook(id: number, book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllBooks(): Observable<any[]> {
    console.log('BookService: Making request to:', `${this.apiUrl}/all`);
    return this.http.get<any[]>(`${this.apiUrl}/all`).pipe(
      tap((response: any) => console.log('BookService: Response received:', response)),
      tap((response: any) => console.log('BookService: Response type:', typeof response, Array.isArray(response))),
      catchError((error: any) => {
        console.error('BookService: Error occurred:', error);
        throw error;
      })
    );
  }

  addBookToMyLibrary(book: any): Observable<Book> {
    const bookData = {
      title: book.title,
      author: book.author,
      publishedDate: book.publishedDate,
      genre: book.genre || '',
      isbn: book.isbn || ''
    };
    return this.http.post<Book>(this.apiUrl, bookData);
  }
}
