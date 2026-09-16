# Auth API

Base path: `/sessions`

## POST /sessions

Authenticates a user with email and password and issues a signed JWT session token.

**Public** — does not require an `Authorization` header.

### Request body

| Field      | Type   | Required | Notes            |
|------------|--------|----------|------------------|
| `email`    | string | yes      | Must be a valid email address |
| `password` | string | yes      | Plain-text password |

```json
{
  "email": "jane@example.com",
  "password": "hunter2"
}
```

### Response `200 OK`

```json
{
  "user": {
    "id": "b3c1e2f0-...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": "https://example.com/avatar.png"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The returned `token` must be sent as `Authorization: Bearer <token>` on every subsequent request to a non-public endpoint.

### Errors

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Body fails schema validation (missing/invalid `email` or `password`) |
| `401 Unauthorized` | No user exists for the given email, or the password does not match |
