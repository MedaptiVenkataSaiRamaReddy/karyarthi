# Karyarthi — Deployment Guide

## Option 1: Railway (Recommended — free tier available)

### Step 1 — Get MongoDB Atlas URI
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Click **Connect** → **Drivers** → copy the URI:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/karyarthi?retryWrites=true&w=majority
   ```

### Step 2 — Deploy to Railway
1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select your repo → Railway auto-detects the `Dockerfile`
4. Add these environment variables in Railway dashboard:

| Variable | Value |
|---|---|
| `SPRING_DATA_MONGODB_URI` | Your Atlas URI from Step 1 |
| `JWT_SECRET` | Any random 32+ char string |
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `RAZORPAY_KEY_ID` | From razorpay.com dashboard |
| `RAZORPAY_KEY_SECRET` | From razorpay.com dashboard |
| `ALLOWED_ORIGINS` | Your Vercel frontend URL |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `SMTP_USER` | Gmail address (optional) |
| `SMTP_PASSWORD` | Gmail App Password (optional) |

5. Railway gives you a public URL like `https://karyarthi.up.railway.app`

### Step 3 — Deploy Frontend to Vercel
1. Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://karyarthi.up.railway.app
   ```
2. Go to [vercel.com](https://vercel.com) → Import `frontend/` folder
3. Done — Vercel auto-deploys on every push

---

## Option 2: Render (also free tier)

Same steps — Render also reads the `Dockerfile` automatically.
Set the same environment variables in Render dashboard.

---

## Local Development

```bash
# 1. Start MongoDB locally
brew services start mongodb-community  # macOS
# or use Docker: docker run -d -p 27017:27017 mongo

# 2. Set env vars
export SPRING_DATA_MONGODB_URI="mongodb://localhost:27017/karyarthi"
export JWT_SECRET="your-local-dev-secret-min-32-chars"
export ANTHROPIC_API_KEY="sk-ant-..."  # optional for dev

# 3. Build and run
./run-dev.sh
```

Frontend dev server (hot reload):
```bash
cd frontend
npm run dev  # starts at http://localhost:5173
```

---

## Admin Setup (First Time)

1. Open `http://localhost:8081/admin/setup` (or your deployed URL)
2. Create admin account
3. Login at `/admin`

---

## Set Up Admin in Production

```bash
curl -X POST https://your-app.railway.app/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin","email":"admin@yourdomain.com","password":"YourSecurePass123"}'
```
