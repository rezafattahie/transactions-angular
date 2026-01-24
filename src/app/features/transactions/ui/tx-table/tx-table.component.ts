import { Component, EventEmitter, input, output } from '@angular/core';
import { ITransaction } from '../../../../shared/models/transaction.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-tx-table',
    standalone: true,
    imports: [DatePipe, DecimalPipe],
    templateUrl: './tx-table.component.html',
})
export class TxTableComponent {
    transactions = input<ITransaction[]>([]);
    loading = input<boolean>(false);
    categoryMap = input<Map<string, string>>(new Map());

    edit = output<ITransaction>();
    remove = output<ITransaction>();

    categoryName(categoryId?: string | null): string {
        if (!categoryId) return '—';
        return this.categoryMap().get(categoryId) ?? '—';
    }

    asDate(value: string | Date | undefined | null): string {
        if (!value) return '—';
        const d = value instanceof Date ? value : new Date(value);
        return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
    }
}
