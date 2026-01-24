import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionsRepository } from './transactions.repository';
import { ApiService } from '../../../core/api/api.service';
import { ITransaction } from '../../../shared/models/transaction.model';

describe('TransactionsRepository', () => {
    let repo: TransactionsRepository;
    let api: {
        get: ReturnType<typeof vi.fn>;
        post: ReturnType<typeof vi.fn>;
        put: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        api = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                TransactionsRepository,
                { provide: ApiService, useValue: api },
            ],
        });

        repo = TestBed.inject(TransactionsRepository);
    });

    it('calls GET with correct query params', () => {
        api.get.mockReturnValue(of([] as ITransaction[]));

        repo.getTransactions({ type: 'expense', pageSize: 15, offset: 0 }).subscribe();

        expect(api.get).toHaveBeenCalledWith('transactions', {
            where: "type='expense'",
            pageSize: 15,
            offset: 0,
            sortBy: 'entryDate desc',
        });
    });

    it('calls POST for create', () => {
        api.post.mockReturnValue(of({ objectId: '1' } as ITransaction));

        repo.createTransaction({
            type: 'income',
            amount: 10,
            category: 'cat1',
            entryDate: new Date().toISOString(),
        }).subscribe();

        expect(api.post).toHaveBeenCalled();
    });

    it('calls PUT for update', () => {
        api.put.mockReturnValue(of({ objectId: '1' } as ITransaction));

        repo.updateTransaction('1', { amount: 20 }).subscribe();

        expect(api.put).toHaveBeenCalledWith('transactions/1', { amount: 20 });
    });

    it('calls DELETE for remove', () => {
        api.delete.mockReturnValue(of(void 0));

        repo.deleteTransaction('1').subscribe();

        expect(api.delete).toHaveBeenCalledWith('transactions/1');
    });
});
