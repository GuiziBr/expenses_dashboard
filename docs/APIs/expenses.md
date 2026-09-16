# Expenses API

Base path: `/expenses`

All routes require authentication (`Authorization: Bearer <token>`). The current user is resolved from the JWT token via `CurrentUserInterceptor`.

An expense's `due_date` is computed server-side from its `date`, `payment_type_id`, and (for payment types with a billing statement) `bank_id`:
- If the payment type has no statement, the due date is the end of the following month (or the current month, if `current_month: true`).
- If the payment type has a statement, the due date is derived from the user's/bank's configured statement period.

## POST /expenses

Creates a new expense owned by the current user.

### Request body

| Field             | Type    | Required | Notes |
|-------------------|---------|----------|-------|
| `description`     | string  | yes      | |
| `date`            | string  | yes      | ISO date; the expense's transaction date. Must not be in the future |
| `amount`          | number  | yes      | Currency units (e.g. dollars); persisted as cents, halved when `split: true` |
| `category_id`     | string  | yes      | |
| `payment_type_id` | string  | yes      | |
| `bank_id`         | string  | no       | Required if the payment type has a statement |
| `store_id`        | string  | no       | |
| `personal`        | boolean | yes      | Whether the expense is personal (not shared) |
| `split`           | boolean | yes      | Whether a shared expense is split between owner and counterpart (amount halved); ignored when `personal: true` |
| `current_month`   | boolean | no       | For payment types with no statement, use the transaction's own month as the due month instead of the following month |

```json
{
  "description": "Groceries",
  "date": "2024-05-01",
  "amount": 120.5,
  "category_id": "cat-id",
  "payment_type_id": "pt-id",
  "bank_id": "bank-id",
  "store_id": "store-id",
  "personal": false,
  "split": true
}
```

### Response `201 Created`

```json
{
  "id": "exp-id",
  "description": "Groceries",
  "date": "2024-05-01T00:00:00.000Z",
  "amount": 6025,
  "category_id": "cat-id",
  "payment_type_id": "pt-id",
  "bank_id": "bank-id",
  "store_id": "store-id",
  "category": { "description": "Groceries" },
  "payment_type": { "description": "Credit Card" },
  "bank": { "name": "Chase" },
  "store": { "name": "Whole Foods" },
  "personal": false,
  "split": true,
  "due_date": "2024-06-30T00:00:00.000Z",
  "owner_id": "user-id",
  "created_at": "2024-05-01T00:00:00.000Z"
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation; `date` is in the future; the payment type has a statement but no `bank_id` was provided; no statement period is configured for the user/bank/payment type; a referenced `category_id`/`payment_type_id`/`bank_id`/`store_id` does not exist; a duplicate expense violates the unique constraint |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | The user resolved from the token no longer exists |
| `500 Internal Server Error` | Unexpected database error |

---

## GET /expenses/personal

Retrieves the current user's personal expenses: expenses they own that are personal or split, plus expenses owned by others that are not personal.

### Query parameters

| Field         | Type     | Default | Notes |
|---------------|----------|---------|-------|
| `startDate`   | string   | —       | Optional inclusive lower bound on `due_date` |
| `endDate`     | string   | today   | Inclusive upper bound on `due_date` |
| `offset`      | number   | `0`     | Min `0` |
| `limit`       | number   | —       | Min `1` |
| `orderBy`     | enum     | —       | One of `description`, `amount`, `date`, `dueDate`, `category`, `payment_type`, `bank`, `store` |
| `orderType`   | enum     | `asc`   | `asc` or `desc` |
| `filterBy`    | enum     | —       | One of `category`, `payment_type`, `bank`, `store` |
| `filterValue` | string   | —       | Value to filter `filterBy` on |

### Response `200 OK`

An array of expenses, each shaped like the `POST /expenses` response. The total matching count (ignoring pagination) is returned in the `X-Total-Count` response header.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Query fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | The user resolved from the token no longer exists |

---

## GET /expenses/shared

Retrieves shared (non-personal) expenses, regardless of owner. Each result is annotated with a `type` of `"income"` (owned by the current user) or `"outcome"` (owned by someone else).

### Query parameters

Same as `GET /expenses/personal`.

### Response `200 OK`

Same shape as `GET /expenses/personal`, plus a `type` field per item:

```json
[
  {
    "id": "exp-id",
    "...": "...",
    "type": "outcome"
  }
]
```

The total matching count (ignoring pagination) is returned in the `X-Total-Count` response header.

### Errors

Same as `GET /expenses/personal`.

---

## PUT /expenses/:id

Updates an existing expense. Only the owning user may update it.

### Request body

Same as `POST /expenses`.

### Response `200 OK`

Same shape as `POST /expenses`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body/params fail schema validation; `date` is in the future; a referenced foreign key does not exist; a duplicate expense violates the unique constraint |
| `401 Unauthorized` | Missing/invalid token |
| `403 Forbidden` | The current user is not the expense's owner |
| `404 Not Found` | The expense does not exist (including if deleted concurrently), or the user resolved from the token no longer exists |
| `500 Internal Server Error` | Unexpected database error |

---

## DELETE /expenses/:id

Soft-deletes an expense by setting its `deletedAt` timestamp. Only the owning user may delete it.

### Response `204 No Content`

No body.

### Errors

| Status | Condition |
|--------|-----------|
| `401 Unauthorized` | Missing/invalid token |
| `403 Forbidden` | The current user is not the expense's owner |
| `404 Not Found` | The expense does not exist, or the user resolved from the token no longer exists |
| `500 Internal Server Error` | Unexpected database error (other than the record already being deleted, which is a no-op) |
