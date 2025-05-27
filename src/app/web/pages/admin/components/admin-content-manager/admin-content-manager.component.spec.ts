import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminContentManagerComponent } from './admin-content-manager.component';

describe('AdminContentManagerComponent', () => {
  let component: AdminContentManagerComponent;
  let fixture: ComponentFixture<AdminContentManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminContentManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminContentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
