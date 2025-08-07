import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Memory {
  id: number;
  title: string;
  description: string;
  image: string;
  coords: string;
}

@Injectable({ providedIn: 'root' })
export class MemoryService {
  private apiUrl = 'http://localhost:8080/api/memories';

  constructor(private http: HttpClient) {}

  getMemories(): Observable<Memory[]> {
    return this.http.get<Memory[]>(this.apiUrl);
  }

  getMemoryById(id: number): Observable<Memory> {
    return this.http.get<Memory>(`${this.apiUrl}/${id}`);
  }
}
