import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { ICategory } from '../../../shared/models/category.model';
import { TransactionType } from '../../../shared/models/transaction-type';

@Injectable({ providedIn: 'root' })
export class CategoriesRepository {
    private api = inject(ApiService);

    getCategories(params: {
        type?: TransactionType;
        pageSize?: number;
        offset?: number;
        sortBy?: string;
    } = {}): Observable<ICategory[]> {
        const where = params.type ? `type='${params.type}'` : undefined;

        return this.api.get<ICategory[]>('categories', {
            where,
            offset: params.offset ?? 0,
            sortBy: params.sortBy ?? 'name asc',
        });
    }
}
