# Balance API

Base path: `/balance`

All routes require authentication (`Authorization: Bearer <token>`). The current user is resolved from the JWT token via `CurrentUserInterceptor`.

## GET /balance

Retrieves the personal and shared balance for the currently authenticated user over a date range.

- **Personal balance**: sum of the user's personal expenses.
- **Shared balance**: net of what the user is paying versus what they're owed, across shared expenses.

### Query parameters

| Field         | Type   | Required | Notes |
|---------------|--------|----------|-------|
| `startDate`   | string | yes      | ISO date, inclusive lower bound |
| `endDate`     | string | yes      | ISO date, inclusive upper bound |
| `filterBy`    | enum   | no       | One of `category`, `payment_type`, `bank`, `store` |
| `filterValue` | string | no       | The id of the `filterBy` record to filter on. Must be a valid UUID when `filterBy` is set |

### Response `200 OK`

```json
{
  "personalBalance": 15000,
  "sharedBalance": {
    "paying": 8000,
    "payed": 5000,
    "total": 3000
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Query fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | The user resolved from the token no longer exists |
| `500 Internal Server Error` | The underlying expense queries fail |

---

## GET /balance/consolidated/:year/:month

Retrieves the consolidated balance report for a given month, comparing the requesting user's totals against their partner's, grouped by owner, payment type/bank, and category. `month` is 1-indexed (January = `1`).

### Route parameters

| Field   | Type   | Notes |
|---------|--------|-------|
| `year`  | number | Min `1900` |
| `month` | number | `1`–`12` |

### Response `200 OK`

```json
{
  "requester": {
    "id": "user-id",
    "name": "Jane Doe",
    "payments": [
      {
        "id": "pt-id",
        "description": "Credit Card",
        "banks": [{ "id": "bank-id", "name": "Chase", "total": 6000 }],
        "total": 6000
      }
    ],
    "categories": [
      { "id": "cat-id", "description": "Groceries", "total": 6000 }
    ],
    "total": 6000
  },
  "partner": {
    "id": "partner-id",
    "name": "John Doe",
    "payments": [],
    "categories": [],
    "total": 4000
  },
  "balance": 2000
}
```

`partner` is omitted if no other user has shared expenses in the given month.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Route params fail schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | The user resolved from the token no longer exists |
| `500 Internal Server Error` | The underlying expense query or aggregation fails |

---

## GET /balance/breakdown/:year/:month

Retrieves the current user's **personal** expense totals for a given month, grouped by a single filter type. Use this to show the total for every category, payment type, bank or store in one request, instead of calling `GET /balance` once per filter value. `month` is 1-indexed (January = `1`).

Personal expenses are the same ones counted in `GET /balance`'s `personalBalance`: the user's own personal or split expenses, plus other users' non-personal expenses. Expenses are included when their due date falls within the given month.

### Route parameters

| Field   | Type   | Notes |
|---------|--------|-------|
| `year`  | number | Min `1900` |
| `month` | number | `1`–`12` |

### Query parameters

| Field      | Type | Required | Notes |
|------------|------|----------|-------|
| `filterBy` | enum | yes      | One of `category`, `payment_type`, `bank`, `store` |

### Response `200 OK`

A JSON array with one entry per filter value that has expenses in the month, sorted by `total` descending. Amounts are in cents. Filter values with no expenses in the month are not returned.

Items use `description` for `category` and `payment_type`:

```json
[
  { "id": "cat-id-1", "description": "Groceries", "total": 42000 },
  { "id": "cat-id-2", "description": "Restaurants", "total": 15000 }
]
```

Items use `name` for `bank` and `store`. Expenses with no bank or store are grouped into a single entry with `id` and `name` set to `null`:

```json
[
  { "id": "bank-id-1", "name": "Chase", "total": 38000 },
  { "id": null, "name": null, "total": 19000 }
]
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Route params or query fail schema validation (e.g. missing or invalid `filterBy`, `month` outside `1`–`12`) |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | The user resolved from the token no longer exists |
| `500 Internal Server Error` | The underlying aggregate query fails |
