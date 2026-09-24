# Controllers

Controllers contain all the business logic for the Thread Trade API. Each controller maps to a specific resource and is invoked by its corresponding route file.

---

## `authController.js`
Handles all authentication flows:
- **register** — Validates input, hashes password with bcrypt, creates a `User` document, issues access + refresh JWT tokens.
- **login** — Verifies credentials, compares hashed password, returns a fresh token pair.
- **refresh** — Validates the refresh token from an HTTP-only cookie and issues a new access token.
- **logout** — Clears the refresh token cookie, ending the session.
- **me** — Returns the currently authenticated user's profile.

---

## `listingController.js`
Manages clothing listings (the core marketplace resource):
- **createListing** — Accepts multipart form data, uploads images to Cloudinary, saves a `Listing` document.
- **getListings** — Supports filtering by category, search query, and sorting; returns paginated results.
- **getListingById** — Fetches a single listing with populated owner fields.
- **updateListing** — Owner-only update; supports partial field updates and image replacement.
- **deleteListing** — Checks ownership before removing the document.
- **getMyListings** — Returns only listings belonging to the authenticated user.

---

## `swapController.js`
Orchestrates the swap request lifecycle:
- **createSwap** — Validates that both items exist, belong to different users, and are available before creating a `SwapRequest`.
- **getMySwaps** — Returns incoming or outgoing swaps depending on the `direction` query param.
- **respondToSwap** — Allows the recipient to `accept`, `reject`, or `complete` a swap; updates statuses on both listings accordingly.
- **getSwapById** — Returns a single swap with populated user and listing fields.

---

## `chatController.js`
Handles persisted chat message history:
- **getChatHistory** — Fetches all `Message` documents for a given swap request, ordered by `createdAt`.
- Real-time messages are saved via the Socket.IO handler; this controller only serves historical reads.

---

## `reviewController.js`
Manages post-swap peer reviews:
- **createReview** — Ensures the swap is `completed` and the reviewer participated before writing a `Review` document.
- **getUserReviews** — Returns all reviews targeting a specific user with average rating.

---

## `notificationController.js`
Provides in-app notification access:
- **getNotifications** — Returns all notifications for the authenticated user.
- **markRead** — Marks a specific notification as read.

---

## `reportController.js`
Allows users to flag listings or users for moderation:
- **createReport** — Creates a `Report` document linking reporter → target with a reason string.

---

## `userController.js`
Exposes public user profile data:
- **getUserProfile** — Returns a user's public info (name, location, rating) by ID.
- **updateProfile** — Allows the authenticated user to update their own profile fields.

---

## `adminController.js`
Admin-only operations (requires `role: admin`):
- **getAllUsers** — Paginated list of all registered users.
- **getAllListings** — Full listing index with admin-level details.
- **deleteUser** — Hard-deletes a user and their associated listings.
- **deleteListing** — Force-removes any listing regardless of ownership.
- **getReports** — Returns all filed reports for moderation review.
- **resolveReport** — Marks a report as resolved with an optional admin note.
