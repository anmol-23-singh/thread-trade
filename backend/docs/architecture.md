# Architecture Overview

Thread Trade's backend is a **Node.js + Express REST API** with real-time capabilities via Socket.IO. It follows a layered MVC-style architecture.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM modules) |
| HTTP Framework | Express.js |
| Database | MongoDB Atlas via Mongoose |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh token pattern) |
| Image Storage | Cloudinary |
| Input Validation | express-validator |
| Password Hashing | bcrypt |
| Rate Limiting | express-rate-limit |

---

## Folder Structure

```
backend/
├── server.js              # Entry point — starts HTTP + Socket server
├── src/
│   ├── app.js             # Express app setup (middleware, routes, CORS)
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── cloudinary.js  # Cloudinary SDK setup
│   ├── controllers/       # Business logic handlers (one per resource)
│   ├── middleware/        # Auth guards, error handler, validation runner
│   ├── models/            # Mongoose schema definitions
│   ├── routes/            # Express Router definitions (one per resource)
│   ├── sockets/           # Socket.IO event handlers
│   └── utils/             # Shared helpers (tokens, audit, email, seed)
└── docs/                  # This documentation
```

---

## Request Lifecycle

```
Client Request
     │
     ▼
Express App (app.js)
     │  ├─ CORS
     │  ├─ express.json()
     │  └─ express-rate-limit
     │
     ▼
Route File (e.g. listingRoutes.js)
     │  ├─ protect (JWT auth middleware)
     │  ├─ validation rules
     │  └─ validate middleware
     │
     ▼
Controller (e.g. listingController.js)
     │  ├─ Business logic
     │  ├─ Model interaction (Mongoose)
     │  └─ Cloudinary upload (if needed)
     │
     ▼
Mongoose Model → MongoDB Atlas
     │
     ▼
JSON Response → Client
```

---

## Authentication Flow

Thread Trade uses a **dual-token JWT strategy**:

1. **Access Token** (short-lived: 15 min) — Sent in the `Authorization: Bearer` header on every protected request.
2. **Refresh Token** (long-lived: 30 days) — Stored as an HTTP-only cookie; used to obtain a new access token without re-login.

```
Login → [Access Token + Refresh Token cookie]
         │
         ▼
Access Token expires
         │
         ▼
POST /api/auth/refresh → New Access Token (using cookie)
         │
         ▼
Logout → Clears cookie + invalidates stored refresh token in DB
```

---

## Real-Time Layer

Socket.IO runs on the same HTTP server as Express. When two users open the same swap chat, they both join a Socket.IO room keyed by `swapRequestId`. Messages are:
1. Persisted to MongoDB by the server
2. Broadcast to all room members in real time

See [sockets.md](./sockets.md) for full event documentation.

---

## Error Handling

All unhandled errors are caught by the centralized `errorHandler` middleware and formatted into consistent JSON responses:

```json
{
  "message": "Human-readable error description",
  "errors": [ ... ]   // Only present for validation errors
}
```

HTTP status codes follow REST conventions (`400`, `401`, `403`, `404`, `409`, `422`, `500`).
