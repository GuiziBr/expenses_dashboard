# API Documentation

Documentation for every HTTP API exposed by this service. Each file below covers one resource/controller.

- [Auth](./auth.md) — `/sessions`
- [Users](./users.md) — `/users`
- [Banks](./banks.md) — `/banks`
- [Categories](./categories.md) — `/categories`
- [Payment Types](./payment-types.md) — `/paymentType`
- [Stores](./stores.md) — `/stores`
- [Expenses](./expenses.md) — `/expenses`
- [Balance](./balance.md) — `/balance`
- [Health](./health.md) — `/`

## Conventions

### Base URL

All routes are relative to the server root, e.g. `http://localhost:3000`. The port is controlled by the `PORT` environment variable.

### Authentication

Every route requires a JWT bearer token **unless explicitly marked "Public"** in its documentation. A global guard (`AuthGuard`) validates the token on every incoming request except routes decorated with `@Public()` (currently `POST /sessions` and `GET /`).

To authenticate, send the token issued by `POST /sessions` on subsequent requests:

```
Authorization: Bearer <token>
```

If the header is missing, malformed, or the token is invalid/expired, the API responds `401 Unauthorized`.

Some routes additionally resolve the current user from the token via `CurrentUserInterceptor`, which re-checks the user still exists in the database. If it doesn't, the API responds `404 Not Found` with `"User not found"`.

### Request validation

Request bodies, query strings, and route params are validated with [Zod](https://zod.dev) schemas via a `ZodValidationPipe`. On validation failure, the API responds `400 Bad Request` with a message describing the first failing field, e.g.:

```json
{
  "statusCode": 400,
  "message": "email Invalid input: expected string, received undefined",
  "error": "Bad Request"
}
```

### Error response shape

All errors follow Nest's default HTTP exception shape:

```json
{
  "statusCode": 404,
  "message": "Bank not found",
  "error": "Not Found"
}
```

### Pagination

List endpoints accept `offset` (default `0`) and `limit` (default `20`, capped depending on the resource) query parameters and return a JSON array. Where applicable, the total matching record count (ignoring pagination) is returned via the `X-Total-Count` response header instead of in the body.

### Soft deletion

Most resources (banks, categories, payment types, stores, expenses) are soft-deleted: `DELETE` sets a `deletedAt` timestamp instead of removing the row, and deleted records are excluded from `GET` endpoints. Creating a resource with a name/description that matches a soft-deleted record reactivates it instead of creating a duplicate.
