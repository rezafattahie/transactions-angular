import { test, expect } from '@playwright/test';

test('login -> transactions -> load more -> CRUD', async ({ page }) => {
    await page.route('**/api/data/financeMembers**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                {
                    objectId: 'm1',
                    username: 'demo',
                    email: 'demo@demo.com',
                    passwordHash: '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea',
                    ownerId: 1,
                    updated: new Date().toISOString(),
                    __class: 'financeMembers',
                },
            ]),
        });
    });

    await page.route('**/api/data/categories**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { objectId: 'c1', name: 'Food', type: 'expense', ownerId: 1, updated: '', __class: 'categories' },
            ]),
        });
    });

    let txCall = 0;
    await page.route('**/api/data/transactions**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();

        if (method === 'GET') {
            txCall += 1;

            const firstPage = Array.from({ length: 15 }, (_, i) => ({
                objectId: `t${i}`,
                ownerId: 1,
                updated: '',
                __class: 'transactions',
                type: 'expense',
                category: 'c1',
                description: `row${i}`,
                amount: 10.5,
                entryDate: new Date('2026-01-24T00:00:00.000Z').toISOString(),
            }));

            const secondPage = Array.from({ length: 3 }, (_, i) => ({
                objectId: `t_more_${i}`,
                ownerId: 1,
                updated: '',
                __class: 'transactions',
                type: 'expense',
                category: 'c1',
                description: `more${i}`,
                amount: 7.25,
                entryDate: new Date('2026-01-23T00:00:00.000Z').toISOString(),
            }));

            const body = txCall === 1 ? firstPage : secondPage;

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(body),
            });
            return;
        }

        if (method === 'POST' && url.includes('/api/data/transactions')) {
            const created = {
                objectId: 'new1',
                ownerId: 1,
                updated: '',
                __class: 'transactions',
                type: 'expense',
                category: 'c1',
                description: 'created',
                amount: 99.99,
                entryDate: new Date('2026-01-24T00:00:00.000Z').toISOString(),
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(created),
            });
            return;
        }

        if (method === 'PUT' && url.includes('/api/data/transactions/')) {
            const updated = {
                objectId: 'new1',
                ownerId: 1,
                updated: '',
                __class: 'transactions',
                type: 'expense',
                category: 'c1',
                description: 'updated',
                amount: 50.0,
                entryDate: new Date('2026-01-24T00:00:00.000Z').toISOString(),
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(updated),
            });
            return;
        }

        if (method === 'DELETE' && url.includes('/api/data/transactions/')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: 'null',
            });
            return;
        }

        await route.fallback();
    });

    await page.goto('/login');

    await page.getByTestId('username').fill('demo');
    await page.getByTestId('password').fill('demo');
    await page.getByTestId('login-btn').click();

    await expect(page).toHaveURL(/\/transactions/);

    await expect(page.getByText('Load more')).toBeVisible();
    await page.getByText('Load more').click();
    await expect(page.getByText('Load more')).toBeHidden();

    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByLabel('Amount').fill('99.99');
    await page.getByLabel('Category').selectOption('c1');
    await page.getByLabel('Description').fill('created');
    await page.getByLabel('Date').fill('2026-01-24');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Transaction added')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByLabel('Amount').fill('50');
    await page.getByLabel('Description').fill('updated');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Transaction updated')).toBeVisible();

    await page.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText('Transaction removed')).toBeVisible();
});
