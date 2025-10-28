import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutCallbackComponent } from './logout-callback.component';

describe('LogoutCallbackComponent', () => {
  let component: LogoutCallbackComponent;
  let fixture: ComponentFixture<LogoutCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutCallbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
