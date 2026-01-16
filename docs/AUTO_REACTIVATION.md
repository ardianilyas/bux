# Auto-Reactivation Setup

## Overview
Automatically reactivates users whose suspension has expired. Runs every hour via Vercel Cron.

---

## Setup Instructions

### 1. Add Environment Variable
Add to your `.env.local` and Vercel project settings:
```bash
CRON_SECRET=your-random-secret-here
```
Generate a strong secret: `openssl rand -base64 32`

### 2. Deploy to Vercel
The `vercel.json` configuration will automatically set up the cron job:
- **Schedule**: Every hour (`0 * * * *`)
- **Endpoint**: `/api/cron/reactivate-users`

### 3. Verify Setup
After deployment, check Vercel Dashboard:
- Go to Project → Settings → Cron Jobs
- Confirm the job is listed and active

---

## Testing

### Development Mode
```bash
# Visit this URL while app is running locally:
http://localhost:3000/api/dev/reactivate-users
```

**Response Example:**
```json
{
  "message": "✅ Reactivated 2 user(s)",
  "timestamp": "2026-01-16T12:45:00.000Z",
  "success": true,
  "reactivatedCount": 2,
  "users": [
    { "id": "user123", "email": "john@example.com" },
    { "id": "user456", "email": "jane@example.com" }
  ]
}
```

### Manual Testing Steps
1. Suspend a user with a 1-minute duration (use custom duration in dialog)
2. Wait 1 minute
3. Call the dev endpoint: `curl http://localhost:3000/api/dev/reactivate-users`
4. Check User Management → User should be active

---

## Production Verification

### Check Logs
```bash
vercel logs --follow
```

Look for:
```
[Auto-Reactivate] Starting check for expired suspensions...
[Auto-Reactivate] Found 0 expired suspension(s)
```

### Audit Logs
Auto-reactivations are logged in the audit log table:
- **User**: `system`
- **Action**: `user.activate`
- **Metadata**: Contains `reason: "Automatic reactivation - suspension expired"`

---

## How It Works

1. **Cron Job**: Vercel triggers `/api/cron/reactivate-users` every hour
2. **Authorization**: Checks for `CRON_SECRET` bearer token
3. **Query**: Finds users where `statusExpiresAt <= now()`
4. **Update**: Sets status to `active`, clears reason and expiration
5. **Audit**: Logs the reactivation with system user

---

## Customization

### Change Schedule
Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reactivate-users",
      "schedule": "*/30 * * * *"  // Every 30 minutes
    }
  ]
}
```

**Cron Syntax**: `minute hour day month weekday`
- Every hour: `0 * * * *`
- Every 30 minutes: `*/30 * * * *`
- Daily at midnight: `0 0 * * *`

---

## Troubleshooting

### Cron not running
1. Check `CRON_SECRET` is set in Vercel environment variables
2. Verify cron job is enabled in Vercel dashboard
3. Check deployment logs for errors

### Users not reactivating
1. Check `statusExpiresAt` is set correctly in database
2. Manually trigger dev endpoint to test logic
3. Check audit logs for system-initiated activations
