# Health API

Base path: `/`

## GET /

Health check endpoint. Verifies the service can reach its database by running a trivial query.

**Public** — does not require an `Authorization` header.

### Response `200 OK`

```json
true
```

### Errors

| Status | Condition |
|--------|-----------|
| `503 Service Unavailable` | The database (or another underlying dependency) is unreachable |
