# Payment Types API

Base path: `/paymentType`

All routes require authentication (`Authorization: Bearer <token>`).

## GET /paymentType

Lists payment types, optionally paginated, excluding soft-deleted records.

### Query parameters

| Field    | Type   | Default | Notes |
|----------|--------|---------|-------|
| `offset` | number | `0`     | Min `0` |
| `limit`  | number | `20`    | Min `1`, max `20` |

### Response `200 OK`

```json
[
  {
    "id": "b3c1e2f0-...",
    "description": "Credit Card",
    "has_statement": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": null
  }
]
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Query fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error |

---

## GET /paymentType/:id

Retrieves a single payment type by id.

### Response `200 OK`

```json
{
  "id": "b3c1e2f0-...",
  "description": "Credit Card",
  "has_statement": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No payment type exists with the given id (or it is soft-deleted) |
| `500 Internal Server Error` | Unexpected database error |

---

## POST /paymentType

Creates a new payment type. If a soft-deleted payment type already has the given description, it is reactivated instead of creating a duplicate.

### Request body

| Field           | Type    | Required | Notes |
|-----------------|---------|----------|-------|
| `description`   | string  | yes      | |
| `hasStatement`  | boolean | yes      | Whether this payment type produces a billing statement (e.g. a credit card), which affects how an expense's due date is calculated |

### Response `201 Created`

Same shape as `GET /paymentType/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error |

---

## PATCH /paymentType/:id

Updates a payment type's description and/or `hasStatement` flag. If another active payment type already has the requested description, the update is rejected; if the description only exists on a soft-deleted payment type, this payment type is soft-deleted and the other one is reactivated with the new data.

### Request body

Same as `POST /paymentType`.

### Response `200 OK`

Same shape as `GET /paymentType/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body/params fail schema validation, or another active payment type already has the same description |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No payment type exists with the given id |
| `500 Internal Server Error` | Unexpected database error |

---

## DELETE /paymentType/:id

Soft-deletes a payment type by setting its `deletedAt` timestamp. Deleting a payment type that no longer exists is a no-op.

### Response `204 No Content`

No body.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error (other than the record already being deleted, which is a no-op) |
