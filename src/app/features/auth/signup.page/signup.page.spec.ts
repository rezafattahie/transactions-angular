import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Router } from '@angular/router';
import { SignupPage } from './signup.page';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';


describe('SignupPage', () => {
    const auth = {
        signup: vi.fn(),
    };

    const router = {
        navigateByUrl: vi.fn(),
    };

    const toast = {
        error: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [SignupPage],
            providers: [
                { provide: AuthService, useValue: auth },
                { provide: Router, useValue: router },
                { provide: ToastService, useValue: toast },
            ],
        }).compileComponents();
    });

    it('shows error + toast when form invalid', () => {
        const fixture = TestBed.createComponent(SignupPage);
        const component = fixture.componentInstance;

        component.form.controls.username.setValue('');
        component.form.controls.email.setValue('not-an-email');
        component.form.controls.password.setValue('1');

        component.submit();

        expect(component.error()).toBeTruthy();
        expect(toast.error).toHaveBeenCalled();
        expect(auth.signup).not.toHaveBeenCalled();
    });

    it('navigates to /transactions on successful signup', () => {
        auth.signup.mockReturnValue(of(void 0));

        const fixture = TestBed.createComponent(SignupPage);
        const component = fixture.componentInstance;

        component.form.controls.username.setValue('reza');
        component.form.controls.email.setValue('reza@test.com');
        component.form.controls.password.setValue('secret12');

        component.submit();

        expect(auth.signup).toHaveBeenCalledWith({
            username: 'reza',
            email: 'reza@test.com',
            password: 'secret12',
        });

        expect(router.navigateByUrl).toHaveBeenCalledWith('/transactions');
    });

    it('sets error + toast when signup fails', () => {
        auth.signup.mockReturnValue(throwError(() => new Error('boom')));

        const fixture = TestBed.createComponent(SignupPage);
        const component = fixture.componentInstance;

        component.form.controls.username.setValue('reza');
        component.form.controls.email.setValue('reza@test.com');
        component.form.controls.password.setValue('secret12');

        component.submit();

        expect(component.error()).toBe('boom');
        expect(toast.error).toHaveBeenCalledWith('boom');
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('navigates to /login when goLogin called', () => {
        const fixture = TestBed.createComponent(SignupPage);
        const component = fixture.componentInstance;

        component.goLogin();

        expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });
});
