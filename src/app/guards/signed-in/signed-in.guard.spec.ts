import { TestBed } from '@angular/core/testing';

import { SignedInGuard } from './signed-in.guard';

describe('AuthGuardGuard', () => {
  let guard: SignedInGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SignedInGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
