import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';


@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    username: new FormControl('demo', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('demo123', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const msg = 'Please enter username and password.';
      this.error.set(msg);
      return;
    }

    this.loading.set(true);

    this.auth
      .login({
        username: this.form.controls.username.value.trim(),
        password: this.form.controls.password.value,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/transactions');
        },
        error: (e) => {
          const msg = e instanceof Error ? e.message : 'Login failed';
          this.toast.error(msg);
        },
      });
  }

  goSignup(): void {
    this.router.navigateByUrl('/signup');
  }
}
