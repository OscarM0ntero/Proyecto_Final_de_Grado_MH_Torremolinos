import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminImagesManagerComponent } from './admin-images-manager.component';

describe('AdminImagesManagerComponent', () => {
  let component: AdminImagesManagerComponent;
  let fixture: ComponentFixture<AdminImagesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminImagesManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminImagesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
