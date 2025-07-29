import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeolocationComponent } from './geolocation-component.component';

describe('GeolocationComponentComponent', () => {
  let component: GeolocationComponent;
  let fixture: ComponentFixture<GeolocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeolocationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeolocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
