import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CategoriesRepository } from './categories.repository';
import { ApiService } from '../../../core/api/api.service';
import { ICategory } from '../../../shared/models/category.model';

describe('CategoriesRepository', () => {
    let repo: CategoriesRepository;
    let api: { get: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        api = { get: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                CategoriesRepository,
                { provide: ApiService, useValue: api },
            ],
        });

        repo = TestBed.inject(CategoriesRepository);
    });

    it('fetches categories by type sorted by name', () => {
        api.get.mockReturnValue(of([] as ICategory[]));

        repo.getCategories({ type: 'expense' }).subscribe();

        expect(api.get).toHaveBeenCalledWith('categories', {
            offset: 0,
            where: "type='expense'",
            sortBy: 'name asc',
        });
    });
});
