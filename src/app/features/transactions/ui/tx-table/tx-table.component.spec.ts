import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { describe, it, expect, beforeAll } from 'vitest';
import { TxTableComponent } from './tx-table.component';

describe('TxTableComponent', () => {
  beforeAll(() => {
    registerLocaleData(localeDe);
  });

  it('renders category name and euro sign', async () => {
    await TestBed.configureTestingModule({
      imports: [TxTableComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(TxTableComponent);

    fixture.componentRef.setInput('categoryMap', new Map([['c1', 'Food']]));
    fixture.componentRef.setInput('transactions', [
      {
        objectId: 't1',
        ownerId: 1,
        updated: new Date().toISOString(),
        __class: 'transactions',
        type: 'expense',
        category: 'c1',
        amount: 12.5,
        entryDate: new Date('2026-01-24T00:00:00.000Z').toISOString(),
        description: 'Lunch',
      } as any,
    ]);

    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');
    expect(text).toContain('Food');
    expect(text).toContain('€');
    expect(text).toContain('2026');
  });
});
