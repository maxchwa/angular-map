import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';  constructor(private http: HttpClient) {}  getUsers(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}