import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-trans-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div data-testid="tx-table" class="bg-slate-800 rounded-2xl p-4 ring-1 ring-slate-700">
      <p class="text-slate-300 text-sm">
        Placeholder list. Next step: paste your extracted Transactions UI here.
      </p>
    </div>
  `,
})
export class TransListComponent { }
