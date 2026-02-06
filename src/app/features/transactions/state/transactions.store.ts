import { Injectable, signal, computed, inject } from '@angular/core';
import { finalize, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TransactionsRepository, CreateTransactionInput, UpdateTransactionInput } from '../data-access/transactions.repository';
import { CategoriesRepository } from '../data-access/categories.repository';
import { ITransaction } from '../../../shared/models/transaction.model';
import { ICategory } from '../../../shared/models/category.model';
import { TransactionType } from '../../../shared/models/transaction-type';
import { ToastService } from '../../../shared/components/toast/toast.service';


@Injectable({ providedIn: 'root' })
export class TransactionsStore {
    private txRepo = inject(TransactionsRepository);
    private catRepo = inject(CategoriesRepository);
    private toast = inject(ToastService);

    private readonly pageSize = 15;


    private txSig = signal<ITransaction[]>([]);
    private catSig = signal<ICategory[]>([]);

    private loadingSig = signal(false);
    private loadingMoreSig = signal(false);
    private savingSig = signal(false);
    private errorSig = signal<string | null>(null);

    private offsetSig = signal(0);
    private hasMoreSig = signal(true);

    readonly transactions = this.txSig.asReadonly();
    readonly categories = this.catSig.asReadonly();
    readonly filters = signal<{ type: 'income' | 'expense'; from?: string | null; to?: string | null; categoryId?: string | null }>({
        type: 'expense',
        from: null,
        to: null,
        categoryId: null,
    });

    readonly loading = this.loadingSig.asReadonly();
    readonly loadingMore = this.loadingMoreSig.asReadonly();
    readonly saving = this.savingSig.asReadonly();
    readonly error = this.errorSig.asReadonly();

    readonly hasMore = this.hasMoreSig.asReadonly();
    readonly canLoadMore = computed(() => this.hasMoreSig() && !this.loadingSig() && !this.loadingMoreSig() && !this.savingSig());

    readonly categoryNames = computed(() => this.catSig().map((c) => c.name));
    readonly categoryMap = computed(() => {
        const map = new Map<string, string>();
        for (const c of this.catSig()) map.set(c.objectId, c.name);
        return map;
    });
    readonly effectiveType = computed<'expense' | 'income'>(() => {
        const f = this.filters();
        if (f.type === 'income') return 'income';
        return 'expense';
    });

    setType(type: TransactionType): void {
        this.loadCategories();
        this.refresh();
    }

    loadInitial(): void {
        this.loadCategories();
        this.refresh();
    }

    refresh(): void {
        this.offsetSig.set(0);
        this.hasMoreSig.set(true);
        this.loadTransactionsPage({ mode: 'replace', offset: 0 }).subscribe();
    }

    setFilters(v: { type: 'income' | 'expense'; from?: string | null; to?: string | null; categoryId?: string | null }) {
        const prev = this.filters();

        const next = { ...v };

        if (prev.type !== next.type) {
            next.categoryId = null;
        }

        this.filters.set(next);
        this.loadCategories();
        this.loadInitial();
    }

    private toStartOfDayMs(dateStr: string): number {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    }

    private toEndOfDayMs(dateStr: string): number {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    }

    private buildWhereFromFilters(): string | undefined {
        const f = this.filters();
        const parts: string[] = [];


        parts.push(`type='${f.type}'`);


        if (f.from) {
            parts.push(`entryDate >= ${this.toStartOfDayMs(f.from)}`);
        }

        if (f.to) {
            parts.push(`entryDate <= ${this.toEndOfDayMs(f.to)}`);
        }

        if (f.categoryId) {
            parts.push(`category='${f.categoryId}'`);
        }

        return parts.length ? parts.join(' AND ') : undefined;
    }


    loadMore(): void {
        if (!this.canLoadMore()) return;
        const nextOffset = this.offsetSig() + this.pageSize;
        this.loadTransactionsPage({ mode: 'append', offset: nextOffset }).subscribe();
    }

    addTransaction(input: CreateTransactionInput): Observable<ITransaction> {
        this.errorSig.set(null);
        this.savingSig.set(true);

        return this.txRepo.createTransaction(input).pipe(
            tap((created) => {
                if (created.type === this.effectiveType()) this.txSig.set([created, ...this.txSig()]);
                this.toast.success('Transaction added');
            }),
            finalize(() => this.savingSig.set(false)),
            catchError((e) => this.handleError<ITransaction>(e))
        );
    }

    editTransaction(objectId: string, patch: UpdateTransactionInput): Observable<ITransaction> {
        this.errorSig.set(null);
        this.savingSig.set(true);

        return this.txRepo.updateTransaction(objectId, patch).pipe(
            tap((updated) => {
                const currentType = this.effectiveType();
                const prevList = this.txSig();
                const idx = prevList.findIndex((t) => t.objectId === objectId);
                if (idx === -1) return;

                const prevItem = prevList[idx];

                if (prevItem.type === currentType && updated.type === currentType) {
                    const next = [...prevList];
                    next[idx] = updated;
                    this.txSig.set(next);
                    this.toast.success('Transaction updated');
                    return;
                }

                if (prevItem.type === currentType && updated.type !== currentType) {
                    this.txSig.set(prevList.filter((t) => t.objectId !== objectId));
                    this.toast.success('Transaction updated');
                    return;
                }

                if (prevItem.type !== currentType && updated.type === currentType) {
                    this.txSig.set([updated, ...prevList]);
                    this.toast.success('Transaction updated');
                }
            }),
            finalize(() => this.savingSig.set(false)),
            catchError((e) => this.handleError<ITransaction>(e))
        );
    }

    removeTransaction(objectId: string): Observable<void> {
        this.errorSig.set(null);
        this.savingSig.set(true);

        return this.txRepo.deleteTransaction(objectId).pipe(
            tap(() => {
                this.txSig.set(this.txSig().filter((t) => t.objectId !== objectId));
                this.toast.info('Transaction removed');
            }),
            finalize(() => this.savingSig.set(false)),
            catchError((e) => this.handleError<void>(e))
        );
    }

    private loadCategories(): void {
        this.loadingSig.set(true);
        this.errorSig.set(null);

        this.catRepo
            .getCategories({ type: this.effectiveType() })
            .pipe(finalize(() => this.loadingSig.set(false)))
            .subscribe({
                next: (cats) => this.catSig.set(cats ?? []),
                error: (e) => this.handleError<void>(e).subscribe(),
            });
    }

    private loadTransactionsPage(args: { mode: 'replace' | 'append'; offset: number }): Observable<ITransaction[]> {
        this.errorSig.set(null);

        if (args.mode === 'replace') this.loadingSig.set(true);
        else this.loadingMoreSig.set(true);
        const where = this.buildWhereFromFilters();


        return this.txRepo
            .getTransactions({
                type: this.effectiveType(),
                where,
                sortBy: 'entryDate desc',
                pageSize: this.pageSize,
                offset: args.offset,
            })
            .pipe(
                tap((tx) => {
                    const items = tx ?? [];
                    this.offsetSig.set(args.offset);

                    if (args.mode === 'replace') this.txSig.set(items);
                    else this.txSig.set([...this.txSig(), ...items]);

                    this.hasMoreSig.set(items.length === this.pageSize);
                }),
                finalize(() => {
                    if (args.mode === 'replace') this.loadingSig.set(false);
                    else this.loadingMoreSig.set(false);
                }),
                catchError((e) => this.handleError<ITransaction[]>(e))
            );
    }

    private handleError<T>(e: unknown): Observable<T> {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        this.errorSig.set(msg);
        this.toast.error(msg);
        return throwError(() => (e instanceof Error ? e : new Error(msg)));
    }
}
