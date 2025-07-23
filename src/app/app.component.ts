import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './map/map.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [MapComponent], // ✅ Tell Angular you want to use it
  template: `<app-map></app-map>`, // ✅ Now Angular recognizes the tag
})
export class AppComponent {}