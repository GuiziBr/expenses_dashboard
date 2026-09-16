# Categories API

Base path: `/categories`

All routes require authentication (`Authorization: Bearer <token>`).

## GET /categories

Lists categories, ordered by description ascending, excluding soft-deleted records.

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
    "description": "Groceries",
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

## GET /categories/:id

Retrieves a single category by id.

### Response `200 OK`

```json
{
  "id": "b3c1e2f0-...",
  "description": "Groceries",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No category exists with the given id (or it is soft-deleted) |
| `500 Internal Server Error` | Unexpected database error |

---

## POST /categories

Creates a new category. If a soft-deleted category already has the given description, it is reactivated instead of creating a duplicate.

### Request body

| Field         | Type   | Required | Notes |
|---------------|--------|----------|-------|
| `description` | string | yes      | Trimmed, non-empty |

### Response `201 Created`

Same shape as `GET /categories/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error |

---

## PATCH /categories/:id

Updates a category's description. If another active category already has the requested description, the update is rejected; if the description only exists on a soft-deleted category, that category is soft-deleted and the target category is updated and reactivated with the new description.

### Request body

Same as `POST /categories`.

### Response `200 OK`

Same shape as `GET /categories/:id`.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body/params fail schema validation, or another active category already has the same description |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | No category exists with the given id |
| `500 Internal Server Error` | Unexpected database error |

---

## DELETE /categories/:id

Soft-deletes a category by setting its `deletedAt` timestamp. Deleting a category that no longer exists is a no-op.

### Response `204 No Content`

No body.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | `id` is not a valid UUID |
| `401 Unauthorized` | Missing/invalid token |
| `500 Internal Server Error` | Unexpected database error (other than the record already being deleted, which is a no-op) |
