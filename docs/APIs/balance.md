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
| `filterBy`    | enum   | no       | One of `category`, `paymentType`, `bank`, `store` |
| `filterValue` | string | no       | Value to filter `filterBy` on |

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
