import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxFilters } from './tx-filters';

describe('TxFilters', () => {
  let component: TxFilters;
  let fixture: ComponentFixture<TxFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TxFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TxFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
