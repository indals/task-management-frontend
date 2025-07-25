import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedTaskFormComponent } from './enhanced-task-form.component';

describe('EnhancedTaskFormComponent', () => {
  let component: EnhancedTaskFormComponent;
  let fixture: ComponentFixture<EnhancedTaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedTaskFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnhancedTaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
