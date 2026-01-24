import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../models/toast.model';


let COUNTER = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toastsSig = signal<Toast[]>([]);
    readonly toasts = this.toastsSig.asReadonly();

    show(message: string, type: ToastType = 'info', durationMs = 3000): void {
        const toast: Toast = {
            id: ++COUNTER,
            type,
            message,
            durationMs,
        };

        this.toastsSig.set([...this.toastsSig(), toast]);

        setTimeout(() => this.remove(toast.id), durationMs);
    }

    success(message: string, durationMs?: number): void {
        this.show(message, 'success', durationMs);
    }

    error(message: string, durationMs?: number): void {
        this.show(message, 'error', durationMs);
    }

    info(message: string, durationMs?: number): void {
        this.show(message, 'info', durationMs);
    }

    remove(id: number): void {
        this.toastsSig.set(this.toastsSig().filter((t) => t.id !== id));
    }
}
