import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgHorizontalComponent } from './img-horizontal.component';

describe('ImgHorizontalComponent', () => {
  let component: ImgHorizontalComponent;
  let fixture: ComponentFixture<ImgHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImgHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
