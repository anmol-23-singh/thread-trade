# Middleware

Middleware functions are applied to routes in `src/app.js` and individual route files. They intercept requests before they reach controllers.

---

## `auth.js`

### `protect`
Authenticates requests using JWT.

**How it works:**
1. Reads the `Authorization` header and extracts the `Bearer <token>`.
2. Verifies the token using `JWT_ACCESS_SECRET`.
3. Fetches the corresponding `User` document from MongoDB.
4. Attaches the user object to `req.user` for downstream access.
5. Calls `next()` on success, or returns `401 Unauthorized` on failure.

```js
// Usage
router.get('/me', protect, authController.me);
```

### `adminGuard`
Ensures the authenticated user has `role: admin`. Must be used **after** `protect`.

```js
// Usage
router.delete('/users/:id', protect, adminGuard, adminController.deleteUser);
```

---

## `errorHandler.js`

A centralized Express error-handling middleware registered at the end of the middleware stack in `app.js`.

**Handles:**
- **Mongoose `ValidationError`** — Returns `400` with field-level error messages extracted from the error object.
- **Mongoose `CastError`** (invalid ObjectId) — Returns `400 Bad Request`.
- **Duplicate key errors** (`code 11000`) — Returns `409 Conflict` with the duplicate field name.
- **JWT errors** — Returns `401 Unauthorized`.
- **All other errors** — Returns `500 Internal Server Error` with a generic message in production, or the actual stack trace in development.

```js
// Registered last in app.js
app.use(errorHandler);
```

---

## `validate.js`

A thin wrapper around `express-validator` that runs a chain of validation rules and short-circuits the request with a `422 Unprocessable Entity` response if any rule fails.

**Usage pattern:**
```js
import { body } from 'express-validator';
import validate from '../middleware/validate.js';

router.post('/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty(),
  ],
  validate,
  authController.register
);
```

The `validate` function itself reads `validationResult(req)` and formats errors as:
```json
{
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```
