import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-ip-address',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `<p>Your IP: {{ ip }}</p>`,
})




export class IpAddressComponent {
  ip: string = '';
  private http = inject(HttpClient);

  constructor() {
    this.http.get('http://localhost:8080/api/users/ip', { responseType: 'text' })
      .subscribe({
        next: (data) => this.ip = data,
        error: (err) => console.error('Error fetching IP:', err)
      });
  }
}

