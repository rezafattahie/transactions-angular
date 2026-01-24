import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-slate-100">Page not found</h1>
        <a class="text-sky-400 hover:text-sky-300 underline" routerLink="/transactions">Go to Transactions</a>
      </div>
    </div>
  `,
})
export class NotfoundComponent { }
