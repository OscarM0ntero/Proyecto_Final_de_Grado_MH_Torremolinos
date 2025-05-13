import { TestBed } from '@angular/core/testing';

import { ContenidoWebService } from './contenido-web.service';

describe('ContenidoWebService', () => {
  let service: ContenidoWebService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContenidoWebService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
