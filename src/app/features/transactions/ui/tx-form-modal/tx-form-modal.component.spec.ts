import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi, describe, it, expect } from 'vitest';
import { TxFormModalComponent } from './tx-form-modal.component';
import { TransactionsStore } from '../../state/transactions.store';

describe('TxFormModalComponent', () => {
    it('calls addTransaction on submit when not editing', async () => {
        const storeStub = {
            type: vi.fn(() => 'expense'),
            categories: vi.fn(() => [{ objectId: 'c1', name: 'Food' }]),
            saving: vi.fn(() => false),
            addTransaction: vi.fn(() => of({ objectId: 't1' })),
            editTransaction: vi.fn(() => of({ objectId: 't1' })),
        };

        await TestBed.configureTestingModule({
            imports: [TxFormModalComponent],
            providers: [{ provide: TransactionsStore, useValue: storeStub }],
        }).compileComponents();

        const fixture = TestBed.createComponent(TxFormModalComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('open', true)
        fixture.componentRef.setInput('editing', null)

        fixture.detectChanges();

        component.form.setValue({
            amount: 10,
            category: 'c1',
            description: 'x',
            entryDate: '2026-01-24',
        });

        component.submit();

        expect(storeStub.addTransaction).toHaveBeenCalled();
    });

    it('calls editTransaction on submit when editing', async () => {
        const storeStub = {
            type: vi.fn(() => 'expense'),
            categories: vi.fn(() => [{ objectId: 'c1', name: 'Food' }]),
            saving: vi.fn(() => false),
            addTransaction: vi.fn(() => of({ objectId: 't1' })),
            editTransaction: vi.fn(() => of({ objectId: 't1' })),
        };

        await TestBed.configureTestingModule({
            imports: [TxFormModalComponent],
            providers: [{ provide: TransactionsStore, useValue: storeStub }],
        }).compileComponents();

        const fixture = TestBed.createComponent(TxFormModalComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('open', true)
        fixture.componentRef.setInput('editing', {
            objectId: 't1',
            type: 'expense',
            category: 'c1',
            amount: 10,
            entryDate: new Date().toISOString(),
        } as any)


        fixture.detectChanges();

        component.form.patchValue({
            amount: 20,
            category: 'c1',
            description: 'y',
            entryDate: '2026-01-24',
        });

        component.submit();

        expect(storeStub.editTransaction).toHaveBeenCalledWith('t1', expect.any(Object));
    });
});
