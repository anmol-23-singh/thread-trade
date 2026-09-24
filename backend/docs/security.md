# Security

This document describes the security measures implemented in the Thread Trade backend.

---

## Authentication & Authorization

### JWT Dual-Token Strategy
- **Access tokens** are short-lived (15 minutes) to minimize exposure if intercepted.
- **Refresh tokens** are long-lived (30 days) but stored as **HTTP-only cookies**, making them inaccessible to JavaScript (prevents XSS theft).
- Refresh tokens are also stored hashed in the database, allowing server-side revocation on logout.

### Password Hashing
All passwords are hashed using **bcrypt** with a salt round of `12` before being stored in MongoDB. Plain-text passwords are never persisted.

---

## CORS

Cross-Origin Resource Sharing is configured to only allow requests from the trusted frontend origin defined by `CLIENT_URL` in environment variables:

```js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Required for cookie-based refresh tokens
}));
```

In production (`thread-trade.vercel.app`), only the Vercel deployment URL is whitelisted.

---

## Rate Limiting

`express-rate-limit` is applied globally to prevent brute-force and DDoS attacks:

| Setting | Value |
|---------|-------|
| Window | 15 minutes (`900,000ms`) |
| Max requests | 200 per window per IP |
| Response on limit | `429 Too Many Requests` |

Auth routes (`/api/auth/login`, `/api/auth/register`) can optionally have a stricter separate limiter.

---

## Input Validation

All user-supplied data is validated using **express-validator** before reaching controllers. Validation rules check:
- Required fields
- Type correctness (email format, number ranges)
- String length limits
- Enum membership (valid category values, etc.)

Invalid requests are rejected early with `422 Unprocessable Entity` before any database interaction occurs.

---

## Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| `user` | CRUD own listings, create/respond to swaps, chat, review, report |
| `admin` | All user capabilities + manage all users, listings, and reports |

The `adminGuard` middleware checks `req.user.role === 'admin'` and returns `403 Forbidden` for non-admin access attempts on protected admin routes.

---

## Ownership Checks

Controllers that modify resources (update/delete listing, respond to swap) verify that the requesting user is the **owner** of the resource before proceeding. This prevents horizontal privilege escalation.

---

## Environment Secrets

Sensitive values (JWT secrets, Cloudinary API keys, MongoDB URI) are never committed to version control. They are stored in `.env` (gitignored) and in the hosting platform's environment variables (Render for backend, Vercel for frontend).

---

## Audit Logging

All destructive admin actions (delete user, delete listing, resolve report) are written to an immutable `AuditLog` collection with a timestamp and the acting admin's ID. This ensures accountability for moderation actions.
