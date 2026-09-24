# Configuration

Configuration modules live in `src/config/` and are responsible for setting up external service connections that the rest of the app depends on.

---

## `db.js` — MongoDB Connection

Establishes a connection to MongoDB Atlas using Mongoose.

**How it works:**
- Reads `MONGO_URI` from environment variables.
- Calls `mongoose.connect()` with recommended options (`useNewUrlParser`, `useUnifiedTopology`).
- Logs a success message on connection or exits the process on failure.

**Usage:**
```js
// Called once at server startup in server.js
import connectDB from './src/config/db.js';
await connectDB();
```

**Connection string format:**
```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/threadtrade?retryWrites=true&w=majority
```

---

## `cloudinary.js` — Image Storage

Configures the Cloudinary SDK for uploading clothing listing images.

**How it works:**
- Reads `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from environment variables.
- Calls `cloudinary.config({ ... })` to authenticate the SDK.
- Exports the configured `cloudinary` instance for use in `listingController.js`.

**Usage in controllers:**
```js
import cloudinary from '../config/cloudinary.js';

const result = await cloudinary.uploader.upload(filePath, {
  folder: 'thread-trade/listings',
  transformation: [{ width: 800, quality: 'auto' }],
});
// result.secure_url → stored in Listing.images[]
```

**Image upload flow:**
1. User submits a listing form with image files via multipart/form-data.
2. Multer (memory storage) buffers the files in `req.files`.
3. Each file buffer is streamed to Cloudinary using an upload stream.
4. The returned `secure_url` values are stored in the `Listing.images` array.

---

## Environment Variables Reference

All configuration is driven by environment variables defined in `.env` (not committed to version control). See `.env.example` for the full list:

| Variable | Description |
|----------|-------------|
| `PORT` | Express server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token TTL (default: `30d`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `RATE_LIMIT_WINDOW_MS` | Rate limiter window in ms (default: `900000` = 15 min) |
| `RATE_LIMIT_MAX` | Max requests per window (default: `200`) |
