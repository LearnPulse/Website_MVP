# LearnPulse — Free Deployment Guide

| Layer | Service | Free tier |
|---|---|---|
| Frontend | Vercel | Unlimited hobby deployments |
| Backend | Google Cloud Run | 2M req/month + 360k vCPU-s |
| Database | Neon | 0.5 GB, never sleeps |
| Auth | NextAuth + Google OAuth | Free |
| LLM + Embeddings | Gemini 1.5 Flash | 15 RPM / 1M tokens/day |
| Vector store | ChromaDB (embedded in container) | Free |
| Text-to-Speech | Google Cloud Text-to-Speech | Pay-as-you-go (low cost for MVP) |

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
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com texttospeech.googleapis.com
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

### Secrets (recommended: Secret Manager)

For production, store secrets in **Google Secret Manager** instead of plain Cloud Run env vars.

1. Enable Secret Manager:
```bash
gcloud services enable secretmanager.googleapis.com
```

2. Create secrets (examples):
```bash
printf '%s' '<neon-url>' | gcloud secrets create DATABASE_URL --data-file=-
printf '%s' 'true' | gcloud secrets create DATABASE_SSL --data-file=-
printf '%s' '<gemini-key>' | gcloud secrets create GEMINI_API_KEY --data-file=-
printf '%s' '<jwt-secret>' | gcloud secrets create JWT_SECRET_KEY --data-file=-
```

3. Grant Cloud Run service access to secrets:
```bash
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:<cloud-run-sa>@<project-id>.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

4. Deploy using secrets:
```bash
gcloud run deploy learnpulse-backend \
  --image us-central1-docker.pkg.dev/learnpulse-mvp/learnpulse/backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets "\
DATABASE_URL=DATABASE_URL:latest,\
DATABASE_SSL=DATABASE_SSL:latest,\
GEMINI_API_KEY=GEMINI_API_KEY:latest,\
JWT_SECRET_KEY=JWT_SECRET_KEY:latest" \
  --set-env-vars "GOOGLE_CLIENT_ID=<id>,CORS_ORIGINS=[\"https://<your-app>.vercel.app\"]"
```

### Text-to-Speech (recommended config)

The backend is set up to use **Application Default Credentials** on Cloud Run (no service-account JSON in your repo).

1. Ensure the API is enabled: `texttospeech.googleapis.com`
2. Run Cloud Run as a service account that has permission to call Text-to-Speech.
   - Typical role: `roles/texttospeech.user`

> **Storage note**: ChromaDB and uploaded files live inside the container and are wiped on redeploy.  
> For persistence, switch to a managed vector store (or move embeddings to Postgres/pgvector) and store uploads / KG in durable storage (Cloud Storage or Postgres).

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

---

## 9. CI/CD (GitHub Actions + Cloud Run)

Recommended approach: GitHub Actions deploys the backend to Cloud Run on every push to `main`, and Vercel auto-deploys the frontend from GitHub.

Backend CI/CD requires:
- Artifact Registry repo exists (step 5)
- Secret Manager secrets exist (section 5)
- GitHub → GCP auth method
  - Best: Workload Identity Federation (no long-lived key)

Implementation:
- Add a workflow at `.github/workflows/backend-cloudrun.yml`
- Configure repository secrets for project id, region, and the Workload Identity Provider + service account

GitHub repository secrets expected by the workflow:
- `GCP_PROJECT_ID`
- `GCP_REGION` (e.g. `us-central1`)
- `GCP_ARTIFACT_REPO` (e.g. `learnpulse`)
- `CLOUD_RUN_SERVICE` (e.g. `learnpulse-backend`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` (full resource name)
- `GCP_DEPLOYER_SERVICE_ACCOUNT` (service account email used by GitHub Actions to deploy)
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT` (optional; runtime service account email)
- `GOOGLE_CLIENT_ID`
- `CORS_ORIGIN` (e.g. `your-app.vercel.app`)

Secret Manager secrets expected by the workflow (names matter):
- `DATABASE_URL`
- `DATABASE_SSL`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `JWT_SECRET_KEY`
