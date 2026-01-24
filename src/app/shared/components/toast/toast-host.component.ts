import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
    selector: 'app-toast-host',
    standalone: true,
    templateUrl: './toast-host.component.html',
})
export class ToastHostComponent {
    service = inject(ToastService);
}
