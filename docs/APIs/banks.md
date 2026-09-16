# Banks API

Base path: `/banks`

All routes require authentication (`Authorization: Bearer <token>`).

## GET /banks

Lists banks, ordered by name ascending, excluding soft-deleted records.

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
    "name": "Chase",
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

## GET /banks/:id

Retrieves a single bank by id.

### Response `200 OK`

```json
{
  "id": "b3c1e2f0-...",
  "name": "Chase",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No bank exists with the given id (or it is soft-deleted) |
| `500 Internal Server Error` | Unexpected database error |

---

## POST /banks

Creates a new bank. If a soft-deleted bank already has the given name, it is reactivated instead of creating a duplicate.

### Request body

| Field  | Type   | Required | Notes |
|--------|--------|----------|-------|
| `name` | string | yes      | Trimmed, non-empty |

### Response `201 Created`

Same shape as `GET /banks/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error |

---

## PATCH /banks/:id

Updates a bank's name. If another active bank already uses the requested name, the update is rejected; if the name only exists on a soft-deleted bank, that bank is renamed and the target bank is renamed and reactivated.

### Request body

Same as `POST /banks`.

### Response `200 OK`

Same shape as `GET /banks/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body/params fail schema validation, or another active bank already uses the requested name (including a race caught as a unique constraint violation) |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No bank exists with the given id |
| `500 Internal Server Error` | Unexpected database error |

---

## DELETE /banks/:id

Soft-deletes a bank by setting its `deletedAt` timestamp. Deleting a bank that no longer exists is a no-op.

### Response `204 No Content`

No body.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error (other than the record already being deleted, which is a no-op) |
