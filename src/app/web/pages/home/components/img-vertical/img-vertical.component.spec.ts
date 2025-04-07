import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgVerticalComponent } from './img-vertical.component';

describe('ImgVerticalComponent', () => {
  let component: ImgVerticalComponent;
  let fixture: ComponentFixture<ImgVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImgVerticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
