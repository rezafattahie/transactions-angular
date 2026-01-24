import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Router } from '@angular/router';
import { LoginPage } from './login.page';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';


describe('LoginPage', () => {
    const auth = {
        login: vi.fn(),
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
            imports: [LoginPage],
            providers: [
                { provide: AuthService, useValue: auth },
                { provide: Router, useValue: router },
                { provide: ToastService, useValue: toast },
            ],
        }).compileComponents();
    });

    it('shows error + toast when form invalid', () => {
        const fixture = TestBed.createComponent(LoginPage);
        const component = fixture.componentInstance;

        component.form.controls.username.setValue('');
        component.form.controls.password.setValue('');

        component.submit();

        expect(component.error()).toBeTruthy();
        expect(toast.error).toHaveBeenCalled();
        expect(auth.login).not.toHaveBeenCalled();
    });

    it('navigates to /transactions on successful login', () => {
        auth.login.mockReturnValue(of(void 0));

        const fixture = TestBed.createComponent(LoginPage);
        const component = fixture.componentInstance;

        component.form.controls.username.setValue('demo');
        component.form.controls.password.setValue('demo');

        component.submit();

        expect(auth.login).toHaveBeenCalledWith({ username: 'demo', password: 'demo' });
        expect(router.navigateByUrl).toHaveBeenCalledWith('/transactions');
    });

    it('sets error + toast when login fails', () => {
        auth.login.mockReturnValue(throwError(() => new Error('boom')));

        const fixture = TestBed.createComponent(LoginPage);
        const component = fixture.componentInstance;

        component.form.controls.username.setValue('demo');
        component.form.controls.password.setValue('demo');

        component.submit();

        expect(component.error()).toBe('boom');
        expect(toast.error).toHaveBeenCalledWith('boom');
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('navigates to /signup when goSignup called', () => {
        const fixture = TestBed.createComponent(LoginPage);
        const component = fixture.componentInstance;

        component.goSignup();

        expect(router.navigateByUrl).toHaveBeenCalledWith('/signup');
    });
});
