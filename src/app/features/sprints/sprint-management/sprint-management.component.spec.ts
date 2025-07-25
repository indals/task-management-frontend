import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintManagementComponent } from './sprint-management.component';

describe('SprintManagementComponent', () => {
  let component: SprintManagementComponent;
  let fixture: ComponentFixture<SprintManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprintManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
