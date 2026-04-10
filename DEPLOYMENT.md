# Deployment Guide

This repo is split into two deployable apps:

- `semantic-transaction-classifier-backend`: Express API, Prisma, PostgreSQL
- `semantic-transaction-classifier-frontend`: Vite React app

The free production setup is:

- Backend on Render free web service
- PostgreSQL on Neon free tier
- Frontend on Vercel hobby/free tier

Do not create a Render-managed PostgreSQL database for a free long-running demo. Render's free PostgreSQL option is temporary, so this guide uses Neon for the database.

## Database: Neon

1. Create a Neon account.
2. Create a free PostgreSQL project.
3. Copy the pooled or direct PostgreSQL connection string.
4. Keep it ready as `DATABASE_URL`.

## Backend: Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from the repository.
3. Render will read `render.yaml` and create:
   - a free Node web service rooted at `semantic-transaction-classifier-backend`
4. Set these backend environment variables in Render:

```bash
DATABASE_URL=your_neon_postgres_connection_string
AI_PROVIDER_API_KEY=your_google_genai_api_key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

The backend build command is:

```bash
npm ci && npx prisma generate
```

The backend start command is:

```bash
npm run render:start
```

That command runs Prisma migrations, seeds the category master data, and starts the API.

After deploy, verify:

```text
https://your-render-service.onrender.com/health
```

Expected response:

```json
{ "status": "ok" }
```

## Frontend: Vercel

1. Import the same GitHub repository into Vercel.
2. Set the project root directory to:

```text
semantic-transaction-classifier-frontend
```

3. Set the build settings:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

4. Set this frontend environment variable:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

5. Deploy the frontend.

6. Copy the final Vercel URL back into the Render backend `CORS_ORIGIN` value.

## Local Production Check

Backend:

```bash
cd semantic-transaction-classifier-backend
npm ci
npm run migrate:deploy
npm run db:seed
npm start
```

Frontend:

```bash
cd semantic-transaction-classifier-frontend
copy .env.example .env
npm ci
npm run build
npm run preview
```

For local frontend development, `VITE_API_BASE_URL` can stay empty because Vite proxies `/api` requests to `http://localhost:4000`.
