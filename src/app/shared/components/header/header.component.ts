import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    private router = inject(Router);
    private auth = inject(AuthService);

    title = input<string>('Transactions');


    readonly showLogout = computed(() => this.auth.isAuthenticated());
    readonly currentMember = computed(() => this.auth.readSession()!);

    async logout(): Promise<void> {
        this.auth.logout();
        await this.router.navigateByUrl('/login');
    }

}
