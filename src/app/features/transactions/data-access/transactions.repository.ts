import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { ITransaction } from '../../../shared/models/transaction.model';
import { TransactionType } from '../../../shared/models/transaction-type';

export type CreateTransactionInput = {
    type: TransactionType;
    amount: number;
    category: string; // category objectId
    description?: string;
    entryDate: string; // ISO string
    period?: string;
    nextDate?: string;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

@Injectable({ providedIn: 'root' })
export class TransactionsRepository {
    private api = inject(ApiService);

    getTransactions(params: {
        type: TransactionType;
        pageSize: number;
        offset: number;
    }): Observable<ITransaction[]> {
        const where = `type='${params.type}'`;

        return this.api.get<ITransaction[]>('transactions', {
            where,
            pageSize: params.pageSize,
            offset: params.offset,
            sortBy: 'entryDate desc',
        });
    }

    createTransaction(input: CreateTransactionInput): Observable<ITransaction> {
        return this.api.post<ITransaction>('transactions', input);
    }

    updateTransaction(objectId: string, patch: UpdateTransactionInput): Observable<ITransaction> {
        return this.api.put<ITransaction>(`transactions/${objectId}`, patch);
    }

    deleteTransaction(objectId: string): Observable<void> {
        return this.api.delete<void>(`transactions/${objectId}`);
    }
}
