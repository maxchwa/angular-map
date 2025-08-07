import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryService } from './memory-service.component';

describe('MemoryServiceComponent', () => {
  let component: MemoryService;
  let fixture: ComponentFixture<MemoryService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemoryService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
