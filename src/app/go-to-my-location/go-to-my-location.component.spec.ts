import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoToMyLocationControl } from './go-to-my-location.component';

describe('GoToMyLocationComponent', () => {
  let component: GoToMyLocationControl;
  let fixture: ComponentFixture<GoToMyLocationControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoToMyLocationControl]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoToMyLocationControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
