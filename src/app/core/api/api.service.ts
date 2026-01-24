import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);

    private readonly baseUrl = '/api/data';

    get<T>(path: string, params?: QueryParams): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}/${path}`, { params: this.toHttpParams(params) });
    }

    post<T>(path: string, body: unknown, params?: QueryParams): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${path}`, body, { params: this.toHttpParams(params) });
    }

    put<T>(path: string, body: unknown, params?: QueryParams): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${path}`, body, { params: this.toHttpParams(params) });
    }

    delete<T>(path: string, params?: QueryParams): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${path}`, { params: this.toHttpParams(params) });
    }

    private toHttpParams(params?: QueryParams): HttpParams {
        let httpParams = new HttpParams();
        if (!params) return httpParams;

        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null) continue;
            httpParams = httpParams.set(key, String(value));
        }
        return httpParams;
    }
}
