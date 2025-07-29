import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Geolocation from 'ol/Geolocation';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-geolocation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-white rounded-xl shadow-md">
      <p *ngIf="coords; else loading">
        Latitude: {{ coords.latitude }}<br>
        Longitude: {{ coords.longitude }}<br>
        Accuracy: {{ coords.accuracy }} meters
      </p>
      <ng-template #loading>
        <p>Locating...</p>
      </ng-template>
    </div>
  `,
})

export class GeolocationComponent implements OnInit {
  coords:
    | {
        latitude: number;
        longitude: number;
        accuracy: number;
      }
    | null = null;

  ngOnInit(): void {
    const geolocation = new Geolocation({
      tracking: true,
      projection: 'EPSG:4326', // WGS84 (lat/lon)
    });

    geolocation.on('change', () => {
      this.coords = {
        latitude: geolocation.getPosition()?.[1] ?? 0,
        longitude: geolocation.getPosition()?.[0] ?? 0,
        accuracy: geolocation.getAccuracy() ?? 0,      
      };
    });

    geolocation.on('error', (err) => {
      console.error('Geolocation error:', err.message);
    });
  }
}
