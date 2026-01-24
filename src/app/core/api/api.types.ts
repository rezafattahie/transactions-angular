export type ApiQueryParams = Record<string, string | number | boolean | undefined>;

export type PageParams = {
    pageSize?: number;
    offset?: number;
};

export type BackendlessPage<T> = T[];
