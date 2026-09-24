# API Routes

All routes are mounted on the Express app in `src/app.js` under the `/api` prefix. Protected routes require a valid JWT access token in the `Authorization: Bearer <token>` header.

---

## Auth Routes — `/api/auth`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| POST | `/register` | `authController.register` | No |
| POST | `/login` | `authController.login` | No |
| POST | `/refresh` | `authController.refresh` | No (uses cookie) |
| POST | `/logout` | `authController.logout` | Yes |
| GET | `/me` | `authController.me` | Yes |

---

## Listing Routes — `/api/listings`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| GET | `/` | `listingController.getListings` | Yes |
| POST | `/` | `listingController.createListing` | Yes |
| GET | `/mine` | `listingController.getMyListings` | Yes |
| GET | `/:id` | `listingController.getListingById` | Yes |
| PUT | `/:id` | `listingController.updateListing` | Yes (owner) |
| DELETE | `/:id` | `listingController.deleteListing` | Yes (owner) |

---

## Swap Routes — `/api/swaps`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| POST | `/` | `swapController.createSwap` | Yes |
| GET | `/mine` | `swapController.getMySwaps` | Yes |
| GET | `/:id` | `swapController.getSwapById` | Yes |
| POST | `/:id/respond` | `swapController.respondToSwap` | Yes (recipient) |

---

## Chat Routes — `/api/chat`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| GET | `/:swapId/messages` | `chatController.getChatHistory` | Yes |

---

## Review Routes — `/api/reviews`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| POST | `/` | `reviewController.createReview` | Yes |
| GET | `/user/:userId` | `reviewController.getUserReviews` | Yes |

---

## User Routes — `/api/users`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| GET | `/:id` | `userController.getUserProfile` | Yes |
| PUT | `/me` | `userController.updateProfile` | Yes |

---

## Notification Routes — `/api/notifications`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| GET | `/` | `notificationController.getNotifications` | Yes |
| PUT | `/:id/read` | `notificationController.markRead` | Yes |

---

## Report Routes — `/api/reports`

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| POST | `/` | `reportController.createReport` | Yes |

---

## Admin Routes — `/api/admin`

All admin routes require `role: admin` (checked via `AdminGuard` middleware).

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| GET | `/users` | `adminController.getAllUsers` | Yes (admin) |
| DELETE | `/users/:id` | `adminController.deleteUser` | Yes (admin) |
| GET | `/listings` | `adminController.getAllListings` | Yes (admin) |
| DELETE | `/listings/:id` | `adminController.deleteListing` | Yes (admin) |
| GET | `/reports` | `adminController.getReports` | Yes (admin) |
| PUT | `/reports/:id/resolve` | `adminController.resolveReport` | Yes (admin) |
