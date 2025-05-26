import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelLayoutComponent } from './admin-panel-layout.component';

describe('AdminPanelLayoutComponent', () => {
  let component: AdminPanelLayoutComponent;
  let fixture: ComponentFixture<AdminPanelLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPanelLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPanelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
