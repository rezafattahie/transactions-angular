# Decisions

## Locale formatting
Tables use Angular built-in pipes with `de-DE` locale for date and currency formatting.

## Auth approach
A minimal username/password flow backed by `financeMembers`.
Passwords are stored as SHA-256 hashes for demo purposes (not production security).

## Testing strategy
- Unit tests for repositories and store (Vitest)
- Component tests for key pages/components
- E2E (Playwright) with full network mocking to avoid external dependencies
