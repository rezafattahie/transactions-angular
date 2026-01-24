import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'e2e',
    use: {
        baseURL: 'http://localhost:4200',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run start:safe',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 120000,
    },
});
