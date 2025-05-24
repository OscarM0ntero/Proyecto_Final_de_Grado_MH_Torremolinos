import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPanelLayoutComponent } from './client-panel-layout.component';

describe('ClientPanelLayoutComponent', () => {
  let component: ClientPanelLayoutComponent;
  let fixture: ComponentFixture<ClientPanelLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientPanelLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPanelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
