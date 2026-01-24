import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';


@Component({
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './signup.page.html',
})
export class SignupPage {
    private auth = inject(AuthService);
    private router = inject(Router);
    private toast = inject(ToastService);

    loading = signal(false);
    error = signal<string | null>(null);

    form = new FormGroup({
        username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    });

    submit(): void {
        this.error.set(null);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            const msg = 'Please fill all fields correctly.';
            this.error.set(msg);
            this.toast.error(msg);
            return;
        }

        this.loading.set(true);

        this.auth
            .signup({
                username: this.form.controls.username.value.trim(),
                email: this.form.controls.email.value.trim(),
                password: this.form.controls.password.value,
            })
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    this.router.navigateByUrl('/transactions');
                },
                error: (e) => {
                    const msg = e instanceof Error ? e.message : 'Signup failed';
                    this.error.set(msg);
                    this.toast.error(msg);
                },
            });
    }

    goLogin(): void {
        this.router.navigateByUrl('/login');
    }
}
