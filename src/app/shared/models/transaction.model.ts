import { IBase } from './base.model';
import { TransactionType } from './transaction-type';
import { PeriodType } from './period-type';

export interface ITransaction extends IBase {
    type: TransactionType;
    amount: number;
    category: string;
    description?: string;
    entryDate: string | Date;
    period?: PeriodType;
    nextDate?: string | Date;
}
