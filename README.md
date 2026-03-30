# PTM Community 🚀

A production-ready social media platform — **100% free to run**.

## Free Stack

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Firebase Auth** | Google Sign-In only | Free forever |
| **MongoDB Atlas** | All data storage | 512MB free, no card needed |
| **Cloudinary** | Photo & video uploads | 25GB free, no card needed |
| **Vercel** | Hosting | Free hobby plan |

**No Firestore. No Firebase Storage. No credit card required.**

---

## Setup Guide

### 1. Clone and install

```bash
git clone https://github.com/yourname/ptm-community
cd ptm-community
npm install
cp .env.example .env.local
```

### 2. Firebase Auth (Google Sign-In)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → **Authentication** → **Sign-in method** → Enable **Google**
3. **Project Settings** → Web app → copy config values into `.env.local`
4. **Authentication** → **Settings** → **Authorized domains** → Add `ptm-community.vercel.app`

### 3. MongoDB Atlas (Free Database)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → **Try Free**
2. Sign up → Create **FREE M0 cluster** (no credit card)
3. **Database Access** → Add new user → username + password
4. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`)
5. **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` in the string with your actual password
7. Paste into `MONGODB_URI` in `.env.local`

### 4. Cloudinary (Free Media Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Dashboard shows your **Cloud Name**, **API Key**, **API Secret**
3. Add them to `.env.local`

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 6. Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. **Settings → Environment Variables** → add all vars from `.env.local`
4. Deploy!

---

## Architecture

```
Firebase Auth ──→ Google Sign-In popup
       │
       ↓
Next.js API Routes (/api/*)
       │
       ├── MongoDB Atlas (users, posts, comments, likes, messages...)
       │
       └── Cloudinary (photo/video uploads via server-side route)
```

All data goes through Next.js API routes — the frontend never talks to MongoDB directly.

---

## Making someone an Admin

In MongoDB Atlas:
1. Browse Collections → `users` collection
2. Find the user document
3. Edit `role` field → set to `"admin"`

---

## Project Structure

```
app/
  api/           ← All backend logic (Next.js API routes)
    auth/        ← POST: sync Firebase user → MongoDB
    users/       ← GET/PATCH user, follow/unfollow, search
    posts/       ← Feed, create, delete, reels
    upload/      ← Cloudinary upload proxy
    notifications/
    conversations/ + messages/
    communities/
    stories/
    reports/
  (app)/         ← Authenticated pages
    feed/
    reels/
    explore/
    profile/
    messages/
    notifications/
    communities/
    admin/
  login/

lib/
  firebase.ts       ← Auth only
  db/mongoose.ts    ← MongoDB connection
  models/           ← Mongoose schemas
  cloudinary.ts     ← Upload utility
  api.ts            ← Frontend API client
  auth-context.tsx  ← Auth provider

components/
  feed/ reels/ profile/ stories/ layout/ ui/

store/ui-store.ts   ← Zustand (UI state)
```
