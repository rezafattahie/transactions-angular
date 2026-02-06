import { Component, OnInit, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { TxTableComponent } from '../ui/tx-table/tx-table.component';
import { TxFormModalComponent } from '../ui/tx-form-modal/tx-form-modal.component';
import { TransactionsStore } from '../state/transactions.store';
import { TransactionType } from '../../../shared/models/transaction-type';
import { ITransaction } from '../../../shared/models/transaction.model';
import { TxFilters } from '../ui/tx-filters/tx-filters';


@Component({
    standalone: true,
    imports: [HeaderComponent, TxTableComponent, TxFormModalComponent, TxFilters],
    templateUrl: './transactions.page.html',
})
export class TransactionsPage implements OnInit {
    store = inject(TransactionsStore);

    showForm = signal(false);
    editing = signal<ITransaction | null>(null);

    ngOnInit(): void {
        this.store.loadInitial();
    }

    setType(type: TransactionType): void {
        this.store.setType(type);
    }

    loadMore(): void {
        this.store.loadMore();
    }

    openAdd(): void {
        this.editing.set(null);
        this.showForm.set(true);
    }

    openEdit(tx: ITransaction): void {
        this.editing.set(tx);
        this.showForm.set(true);
    }

    closeForm(): void {
        this.showForm.set(false);
        this.editing.set(null);
    }
}
