import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export type TxTypeFilter = 'income' | 'expense';

export interface TxFiltersValue {
  type: TxTypeFilter;
  from?: string | null;
  to?: string | null;
  categoryId?: string | null;
}

@Component({
  selector: 'app-tx-filters',
  standalone: true,
  templateUrl: './tx-filters.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxFilters {
  readonly value = input.required<TxFiltersValue>();
  readonly changed = output<TxFiltersValue>();
  readonly categories = input<{ objectId: string; name: string }[]>([]);

  private readonly _type = signal<TxTypeFilter>('expense');
  private readonly _from = signal<string | null>(null);
  private readonly _to = signal<string | null>(null);
  private readonly _categoryId = signal<string | null>(null);

  type = this._type.asReadonly();
  from = this._from.asReadonly();
  to = this._to.asReadonly();
  categoryId = this._categoryId.asReadonly();

  ngOnInit(): void {
    const v = this.value();
    this._type.set(v.type ?? 'all');
    this._from.set(v.from ?? null);
    this._to.set(v.to ?? null);
    this._categoryId.set(v.categoryId ?? null);
  }

  onType(v: TxTypeFilter) {
    this._type.set(v);
    this.emit();
  }

  onCategory(v: string) {
    this._categoryId.set(v || null);
    this.emit();
  }

  onFrom(v: string | null) {
    this._from.set(v || null);
    this.emit();
  }

  onTo(v: string | null) {
    this._to.set(v || null);
    this.emit();
  }

  clear() {
    this._type.set('expense');
    this._from.set(null);
    this._to.set(null);
    this._categoryId.set(null);
    this.emit();
  }
  private emit() {
    this.changed.emit({
      type: this._type(),
      from: this._from(),
      to: this._to(),
      categoryId: this._categoryId(),
    });
  }
}