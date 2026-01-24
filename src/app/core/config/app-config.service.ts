import { Injectable } from '@angular/core';

export type AppConfig = {
    apiBaseUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class AppConfigService {
    private config: AppConfig = {};

    set(partial: AppConfig): void {
        this.config = { ...this.config, ...partial };
    }

    get(): AppConfig {
        return this.config;
    }
}
