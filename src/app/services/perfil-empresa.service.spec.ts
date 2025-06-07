import { TestBed } from '@angular/core/testing';

import { PerfilEmpresaService } from './perfil-empresa.service';

describe('PerfilEmpresaService', () => {
  let service: PerfilEmpresaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilEmpresaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
