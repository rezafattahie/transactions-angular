import { IBase } from './base.model';
import { TransactionType } from './transaction-type';

export interface ICategory extends IBase {
    name: string;
    type: TransactionType;
}
