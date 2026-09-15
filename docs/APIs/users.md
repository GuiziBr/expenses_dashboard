# Users API

Base path: `/users`

All routes require authentication (`Authorization: Bearer <token>`).

## PATCH /users/avatar

Updates the avatar URL of the currently authenticated user (resolved from the JWT token via `CurrentUserInterceptor`).

### Request body

| Field    | Type   | Required | Notes |
|----------|--------|----------|-------|
| `avatar` | string | yes      | Must be a valid URL |

```json
{
  "avatar": "https://example.com/new-avatar.png"
}
```

### Response `200 OK`

No body.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation, or the update fails a known database constraint (e.g. the user does not exist) |
| `401 Unauthorized` | Missing/invalid token |
| `404 Not Found` | The user resolved from the token no longer exists |
| `500 Internal Server Error` | Unexpected database error |
