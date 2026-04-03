# LearnPulse — Free Deployment Guide

| Layer | Service | Free tier |
|---|---|---|
| Frontend | Vercel | Unlimited hobby deployments |
| Backend | Google Cloud Run | 2M req/month + 360k vCPU-s |
| Database | Neon | 0.5 GB, never sleeps |
| Auth | NextAuth + Google OAuth | Free |
| LLM + Embeddings | Gemini 1.5 Flash | 15 RPM / 1M tokens/day |
| Vector store | ChromaDB (embedded in container) | Free |

---

## 1. Prerequisites

- Google account
- GitHub repo (already done)
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed locally
- Node 20+ and Python 3.11+ for local dev

---

## 2. Google Cloud setup

```bash
gcloud auth login
gcloud projects create learnpulse-mvp --set-as-default
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

---

## 3. Neon database

1. Sign up at [neon.tech](https://neon.tech) (free tier).
2. Create a project → copy the **connection string** (pooled, `postgresql+asyncpg://...`).
3. Note: Neon always requires SSL — set `DATABASE_SSL=true` in your backend env.

Run migrations once:
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL + DATABASE_SSL=true
pip install -r requirements.txt
alembic upgrade head
```

---

## 4. Google OAuth credentials

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create OAuth 2.0 Client ID**.
2. Application type: **Web application**.
3. Authorised JavaScript origins:
   - `http://localhost:3000`
   - `https://<your-app>.vercel.app`
4. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-app>.vercel.app/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**.

---

## 5. Deploy backend → Cloud Run

### Build & push

```bash
cd backend

# One-time: create Artifact Registry repo
gcloud artifacts repositories create learnpulse \
  --repository-format=docker \
  --location=us-central1

# Build + push
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/learnpulse-mvp/learnpulse/backend:latest
```

### Deploy

```bash
gcloud run deploy learnpulse-backend \
  --image us-central1-docker.pkg.dev/learnpulse-mvp/learnpulse/backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "\
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>.neon.tech/learnpulse?sslmode=require,\
DATABASE_SSL=true,\
GEMINI_API_KEY=<key>,\
JWT_SECRET_KEY=<openssl rand -hex 32>,\
GOOGLE_CLIENT_ID=<id>,\
CORS_ORIGINS=[\"https://<your-app>.vercel.app\"]"
```

Note the **Service URL** (e.g. `https://learnpulse-backend-xxxx-uc.a.run.app`).

> **Storage note**: ChromaDB and uploaded files live inside the container and are wiped on redeploy.  
> For persistence, mount a Cloud Storage FUSE volume or switch ChromaDB to a hosted solution later.

---

## 6. Deploy frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Or connect the GitHub repo in the [Vercel dashboard](https://vercel.com) and set these environment variables under **Settings → Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://learnpulse-backend-xxxx-uc.a.run.app` |
| `GOOGLE_CLIENT_ID` | from step 4 |
| `GOOGLE_CLIENT_SECRET` | from step 4 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://<your-app>.vercel.app` |

Vercel automatically redeploys on every push to `main`.

---

## 7. Local development

```bash
# Backend
cd backend
cp .env.example .env    # fill in vars
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local   # fill in vars
npm install
npm run dev
```

---

## 8. Environment variable reference

### backend/.env

```env
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>.neon.tech/learnpulse?sslmode=require
DATABASE_SSL=true
GEMINI_API_KEY=...
GEMINI_CHAT_MODEL=models/gemini-1.5-flash
GEMINI_EMBED_MODEL=models/text-embedding-004
EMBEDDING_BACKEND=gemini
JWT_SECRET_KEY=...
JWT_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=...
CORS_ORIGINS=["https://your-app.vercel.app"]
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=https://learnpulse-backend-xxxx-uc.a.run.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app
```
