import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeListComponent } from './scope-list.component';

describe('ScopeListComponent', () => {
  let component: ScopeListComponent;
  let fixture: ComponentFixture<ScopeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScopeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScopeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
