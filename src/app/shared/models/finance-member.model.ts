import { IBase } from './base.model';

export interface IFinanceMember extends IBase {
    username: string;
    email: string;
    passwordHash: string;
    created?: string;
}