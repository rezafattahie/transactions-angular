import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TransactionsStore } from './transactions.store';
import { TransactionsRepository } from '../data-access/transactions.repository';
import { CategoriesRepository } from '../data-access/categories.repository';
import { ITransaction } from '../../../shared/models/transaction.model';
import { ICategory } from '../../../shared/models/category.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

function makeTx(id: string, type: 'income' | 'expense', category: string, amount = 10): ITransaction {
    return {
        objectId: id,
        ownerId: 1,
        updated: new Date().toISOString(),
        __class: 'transactions',
        type,
        category,
        amount,
        entryDate: new Date('2026-01-24T00:00:00.000Z').toISOString(),
        description: 'x',
    };
}

function makeCat(id: string, type: 'income' | 'expense', name: string): ICategory {
    return {
        objectId: id,
        ownerId: 1,
        updated: new Date().toISOString(),
        __class: 'categories',
        type,
        name,
    } as ICategory;
}

describe('TransactionsStore', () => {
    let store: TransactionsStore;

    const txRepo = {
        getTransactions: vi.fn(),
        createTransaction: vi.fn(),
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
    };

    const catRepo = {
        getCategories: vi.fn(),
    };

    const toast = {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        show: vi.fn(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TransactionsStore,
                { provide: TransactionsRepository, useValue: txRepo },
                { provide: CategoriesRepository, useValue: catRepo },
                { provide: ToastService, useValue: toast },
            ],
        });

        store = TestBed.inject(TransactionsStore);
    });

    it('loads categories and first page (pageSize=15)', () => {
        catRepo.getCategories.mockReturnValue(of([makeCat('c1', 'expense', 'Food')]));
        txRepo.getTransactions.mockReturnValue(
            of(Array.from({ length: 15 }, (_, i) => makeTx(String(i), 'expense', 'c1')))
        );

        store.loadInitial();

        expect(store.categories().length).toBe(1);
        expect(store.transactions().length).toBe(15);
        expect(store.hasMore()).toBe(true);
    });

    it('appends on loadMore and stops when fewer than pageSize returned', () => {
        catRepo.getCategories.mockReturnValue(of([makeCat('c1', 'expense', 'Food')]));
        txRepo.getTransactions
            .mockReturnValueOnce(of(Array.from({ length: 15 }, (_, i) => makeTx(String(i), 'expense', 'c1'))))
            .mockReturnValueOnce(of([makeTx('x1', 'expense', 'c1'), makeTx('x2', 'expense', 'c1')]));

        store.loadInitial();
        store.loadMore();

        expect(store.transactions().length).toBe(17);
        expect(store.hasMore()).toBe(false);
    });

    it('adds transaction to top when type matches', () => {
        catRepo.getCategories.mockReturnValue(of([makeCat('c1', 'expense', 'Food')]));
        txRepo.getTransactions.mockReturnValue(of([]));
        store.loadInitial();

        txRepo.createTransaction.mockReturnValue(of(makeTx('new', 'expense', 'c1', 99)));

        store
            .addTransaction({
                type: 'expense',
                amount: 99,
                category: 'c1',
                entryDate: new Date().toISOString(),
            })
            .subscribe();

        expect(store.transactions()[0].objectId).toBe('new');
        expect(toast.success).toHaveBeenCalled();
    });

    it('removes transaction from list', () => {
        catRepo.getCategories.mockReturnValue(of([makeCat('c1', 'expense', 'Food')]));
        txRepo.getTransactions.mockReturnValue(of([makeTx('t1', 'expense', 'c1')]));
        store.loadInitial();

        txRepo.deleteTransaction.mockReturnValue(of(void 0));

        store.removeTransaction('t1').subscribe();

        expect(store.transactions().length).toBe(0);
        expect(toast.info).toHaveBeenCalled();
    });

    it('does not error on loadInitial when repo returns empty array', () => {
        catRepo.getCategories.mockReturnValue(of([makeCat('c1', 'expense', 'Food')]));
        txRepo.getTransactions.mockReturnValue(of([]));

        store.loadInitial();

        expect(store.error()).toBe(null);
        expect(store.transactions().length).toBe(0);
    });

    it('surfaces errors via toast and store.error on addTransaction', () => {
        catRepo.getCategories.mockReturnValue(of([makeCat('c1', 'expense', 'Food')]));
        txRepo.getTransactions.mockReturnValue(of([]));
        store.loadInitial();

        txRepo.createTransaction.mockReturnValue(throwError(() => new Error('boom')));

        store
            .addTransaction({
                type: 'expense',
                amount: 10,
                category: 'c1',
                entryDate: new Date().toISOString(),
            })
            .subscribe({
                error: () => {
                    expect(store.error()).toBe('boom');
                    expect(toast.error).toHaveBeenCalledWith('boom');
                },
            });
    });

});
