import { TestBed } from '@angular/core/testing';

import { LogoutHubService } from './logout-hub.service';

describe('LogoutHubService', () => {
  let service: LogoutHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogoutHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
