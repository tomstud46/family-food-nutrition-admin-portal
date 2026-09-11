# Family Food Nutrition — Admin Portal v16

## Admin AI

This increment adds the Admin AI workspace against the existing Laravel 12 AI contract.

### API contract used

- `GET /api/v1/ai/tools`
- `POST /api/v1/ai/chat`
- `POST /api/v1/ai/tool`

### Controlled tools

- `customer_summary` — requires `customer_id`
- `order_summary` — requires `order_id`
- `report_overview` — optional `from` / `to` dates

The UI never calls PostgreSQL or domain models directly. Tool execution is sent to Laravel, where validation and authorization remain authoritative.

### Provider state

The current backend uses `UnavailableAiProvider` until an approved external AI provider is configured. The Admin AI page therefore handles provider-unavailable responses explicitly rather than pretending that chat is operational.

### Verification

ZIP integrity verified with `unzip -t`.

The Vite/TypeScript production build was **not verified in this environment** because the available staged `node_modules` was incomplete and reinstalling dependencies was not completed. The package intentionally excludes `node_modules`.
