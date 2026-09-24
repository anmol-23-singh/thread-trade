# Utility Functions

Utility modules live in `src/utils/` and provide reusable helpers used across controllers and other layers.

---

## `generateTokens.js`

Generates a JWT access token and refresh token for a given user.

**Exports:**
- `generateAccessToken(userId)` — Signs a short-lived token (default: `15m`) using `JWT_ACCESS_SECRET`. Payload contains `{ id: userId }`.
- `generateRefreshToken(userId)` — Signs a long-lived token (default: `30d`) using `JWT_REFRESH_SECRET`.

**Usage:**
```js
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';

const accessToken = generateAccessToken(user._id);
const refreshToken = generateRefreshToken(user._id);
```

The refresh token is stored in the database (`user.refreshToken`) and sent as an HTTP-only cookie to the client.

---

## `audit.js`

Writes an immutable record to the `AuditLog` collection whenever an admin performs a sensitive action.

**Export:**
- `logAudit({ admin, action, targetId, targetModel })` — Creates an `AuditLog` document.

**Usage:**
```js
import { logAudit } from '../utils/audit.js';

await logAudit({
  admin: req.user._id,
  action: 'DELETE_USER',
  targetId: userId,
  targetModel: 'User',
});
```

---

## `email.js`

Sends transactional email notifications using Nodemailer (or a compatible email provider configured via environment variables).

**Export:**
- `sendEmail({ to, subject, html })` — Composes and sends an email.

Currently used for:
- Account verification (if enabled)
- Password reset links
- Swap confirmation notifications

> **Note:** In development, emails are logged to the console instead of being sent if `NODE_ENV !== 'production'`.

---

## `seed.js`

A one-time script for seeding the database with sample data during development and testing.

**What it seeds:**
- 10 sample users with hashed passwords
- 30 sample listings spread across categories (Shirt, Dress, Jacket, etc.)
- 5 sample swap requests between seeded users
- 3 sample reviews

**How to run:**
```bash
node src/utils/seed.js
```

> ⚠️ This script **drops and re-creates** the `users` and `listings` collections. Never run it against a production database.

---

## `validators/` directory

Contains `express-validator` rule chains organized by resource, imported into route files.

| File | Validates |
|------|-----------|
| `authValidators.js` | Registration & login fields |
| `listingValidators.js` | Listing creation & update fields |
| `swapValidators.js` | Swap request creation fields |
| `reviewValidators.js` | Review rating and comment fields |

Each validator file exports an array of `body()` / `param()` rules that are spread into route definitions before the `validate` middleware.
