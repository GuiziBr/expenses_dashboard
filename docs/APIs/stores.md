# Stores API

Base path: `/stores`

All routes require authentication (`Authorization: Bearer <token>`).

## GET /stores

Lists stores, ordered by name ascending, excluding soft-deleted records.

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
    "name": "Whole Foods",
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

## GET /stores/:id

Retrieves a single store by id.

### Response `200 OK`

```json
{
  "id": "b3c1e2f0-...",
  "name": "Whole Foods",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No store exists with the given id (or it is soft-deleted) |
| `500 Internal Server Error` | Unexpected database error |

---

## POST /stores

Creates a new store. If a soft-deleted store already has the given name, it is reactivated instead of creating a duplicate.

### Request body

| Field  | Type   | Required | Notes |
|--------|--------|----------|-------|
| `name` | string | yes      | |

### Response `201 Created`

Same shape as `GET /stores/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error |

---

## PATCH /stores/:id

Updates a store's name. If another active store already uses the requested name, the update is rejected; if the name only exists on a soft-deleted store, that store is deleted and the target store is renamed and reactivated.

### Request body

Same as `POST /stores`.

### Response `200 OK`

Same shape as `GET /stores/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body/params fail schema validation, or another active store already uses the requested name |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No store exists with the given id |
| `500 Internal Server Error` | Unexpected database error |

---

## DELETE /stores/:id

Soft-deletes a store by setting its `deletedAt` timestamp. Deleting a store that no longer exists is a no-op.

### Response `204 No Content`

No body.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error (other than the record already being deleted, which is a no-op) |
