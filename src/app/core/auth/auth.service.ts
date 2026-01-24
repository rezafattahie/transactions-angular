import { Injectable, computed, signal, inject } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { TokenStorage } from './token.storage';
import { MembersRepository } from '../../features/auth/data-access/members.repository';
import { IFinanceMember } from '../../shared/models/finance-member.model';
import { ToastService } from '../../shared/components/toast/toast.service';


type Session = {
    memberId: string;
    username: string;
    email: string;
};

const SESSION_KEY = 'finance_session_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private storage = new TokenStorage();
    private membersRepo = inject(MembersRepository);
    private toast = inject(ToastService);

    private tokenSig = signal<string | null>(this.storage.get());
    private sessionSig = signal<Session | null>(this.readSession());

    readonly isAuthenticated = computed(() => !!this.tokenSig());
    readonly session = this.sessionSig.asReadonly();

    signup(input: { username: string; email: string; password: string }): Observable<void> {
        const username = input.username.trim();
        const email = input.email.trim().toLowerCase();
        const password = input.password;

        if (!username || !email || !password) {
            return throwError(() => new Error('All fields are required.'));
        }

        return forkJoin({
            existingUser: this.membersRepo.findByUsername(username).pipe(map((x) => x ?? [])),
            existingEmail: this.membersRepo.findByEmail(email).pipe(map((x) => x ?? [])),
            passwordHash: this.sha256$(password),
        }).pipe(
            switchMap(({ existingUser, existingEmail, passwordHash }) => {
                if (existingUser.length > 0) return throwError(() => new Error('Username already exists.'));
                if (existingEmail.length > 0) return throwError(() => new Error('Email already exists.'));

                return this.membersRepo.createMember({ username, email, passwordHash });
            }),
            tap((created) => this.startSession(created)),
            tap(() => this.toast.success('Account created')),
            map(() => void 0)
        );
    }

    login(input: { username: string; password: string }): Observable<void> {
        const username = input.username.trim();
        const password = input.password;

        if (!username || !password) {
            return throwError(() => new Error('Username and password are required.'));
        }

        return this.membersRepo.findByUsername(username).pipe(
            map((list) => (list ?? [])[0]),
            switchMap((member) => {
                if (!member) return throwError(() => new Error('Invalid username or password.'));
                return this.sha256$(password).pipe(map((hash) => ({ member, hash })));
            }),
            switchMap(({ member, hash }) => {
                if (member.passwordHash !== hash) return throwError(() => new Error('Invalid username or password.'));
                return of(member);
            }),
            tap((member) => this.startSession(member)),
            tap(() => this.toast.success('Welcome back')),
            map(() => void 0)
        );
    }

    logout(): void {
        this.storage.clear();
        localStorage.removeItem(SESSION_KEY);
        this.tokenSig.set(null);
        this.sessionSig.set(null);
        this.toast.info('Logged out');
    }

    private startSession(member: IFinanceMember): void {
        const token = btoa(`${member.username}:${Date.now()}`);
        this.storage.set(token);
        this.tokenSig.set(token);

        const session: Session = {
            memberId: member.objectId,
            username: member.username,
            email: member.email,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        this.sessionSig.set(session);
    }

    readSession(): Session | null {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as Session;
        } catch {
            return null;
        }
    }

    private sha256$(value: string): Observable<string> {
        return new Observable<string>((subscriber) => {
            const bytes = new TextEncoder().encode(value);
            crypto.subtle
                .digest('SHA-256', bytes)
                .then((digest) => {
                    const hash = Array.from(new Uint8Array(digest))
                        .map((b) => b.toString(16).padStart(2, '0'))
                        .join('');
                    subscriber.next(hash);
                    subscriber.complete();
                })
                .catch((err) => subscriber.error(err));
        }).pipe(
            catchError(() => throwError(() => new Error('Unexpected error')))
        );
    }
}
