# Architecture

This repository is a focused, standalone extraction of a Transactions feature built with Angular (standalone components, signals) and RxJS.

## High-level
- `features/auth`: login + signup pages, member repository (Backendless table: `financeMembers`)
- `features/transactions`: transactions page, table, modal, store, repositories
- `core`: cross-cutting concerns (auth, api)
- `shared`: UI utilities (toast), models
- `filtering`: server-side via Backendless where clause using timestamps for datetime range

## Data Flow
UI -> Store -> Repository -> ApiService -> Backendless REST
- Store owns state via signals
- Repositories are thin, testable data-access layers
- Toast is triggered on success/error paths

## Key Decisions
- Use RxJS Observables end-to-end (no async/await)
- Keep repository naming as `*.repository.ts`
- Keep services as `*.service.ts`
- Keep UI simple and readable for hiring review
