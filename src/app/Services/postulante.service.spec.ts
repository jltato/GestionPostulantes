import { TestBed } from '@angular/core/testing';

import { PostulanteService } from './postulante.service';

describe('PostulanteService', () => {
  let service: PostulanteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostulanteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
