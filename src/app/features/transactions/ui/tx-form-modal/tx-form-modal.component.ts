import { Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ITransaction } from '../../../../shared/models/transaction.model';
import { TransactionsStore } from '../../state/transactions.store';

type FormValue = {
    amount: number;
    category: string;
    description: string;
    entryDate: string;
};

@Component({
    selector: 'app-tx-form-modal',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './tx-form-modal.component.html',
})
export class TxFormModalComponent {
    store = inject(TransactionsStore);

    open = input<boolean>(false);
    editing = input<ITransaction | null>(null);

    closed = output<void>();
    saved = output<void>();

    form = new FormGroup({
        amount: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
        category: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        description: new FormControl<string>('', { nonNullable: true }),
        entryDate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    constructor() {
        effect(() => {
            const tx = this.editing();
            if (!tx) {
                this.form.reset({
                    amount: 0,
                    category: '',
                    description: '',
                    entryDate: this.todayISODate(),
                });
                return;
            }

            this.form.reset({
                amount: Number(tx.amount ?? 0),
                category: tx.category ?? '',
                description: tx.description ?? '',
                entryDate: this.toISODate(tx.entryDate),
            });
        });
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const v = this.form.getRawValue() as FormValue;
        const type = this.store.type();

        if (!this.editing()) {
            this.store
                .addTransaction({
                    type,
                    amount: Number(v.amount),
                    category: v.category,
                    description: v.description?.trim() || undefined,
                    entryDate: new Date(v.entryDate).toISOString(),
                })
                .pipe(finalize(() => void 0))
                .subscribe({
                    next: () => this.saved.emit(),
                    error: () => void 0,
                });

            return;
        }

        const tx = this.editing()!;
        this.store
            .editTransaction(tx.objectId, {
                amount: Number(v.amount),
                category: v.category,
                description: v.description?.trim() || undefined,
                entryDate: new Date(v.entryDate).toISOString(),
                type,
            })
            .pipe(finalize(() => void 0))
            .subscribe({
                next: () => this.saved.emit(),
                error: () => void 0,
            });
    }

    close(): void {
        this.closed.emit();
    }

    title(): string {
        return this.editing() ? 'Edit transaction' : 'Add transaction';
    }

    private todayISODate(): string {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private toISODate(value: string | Date): string {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return this.todayISODate();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
}
