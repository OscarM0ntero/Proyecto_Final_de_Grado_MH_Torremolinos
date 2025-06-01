import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBookingManagerComponent } from './client-booking-manager.component';

describe('ClientBookingManagerComponent', () => {
  let component: ClientBookingManagerComponent;
  let fixture: ComponentFixture<ClientBookingManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientBookingManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientBookingManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
