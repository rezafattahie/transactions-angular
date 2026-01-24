export type AuthToken = string;

const TOKEN_KEY = 'auth_token_v1';

export class TokenStorage {
    get(): AuthToken | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    set(token: AuthToken): void {
        localStorage.setItem(TOKEN_KEY, token);
    }

    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
    }
}
