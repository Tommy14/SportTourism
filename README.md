# Cricket Tour Sri Lanka

One-page tourism + cricket package website with hidden admin portal, inquiry emails, and editable content.

## Stack

- Next.js (App Router)
- Prisma + PostgreSQL (content + image blobs)
- Resend (inquiry notification emails)

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate`
5. Seed starter content:
   - `npm run prisma:seed`
6. Start dev server:
   - `npm run dev`

## Environment variables

Required for production email delivery:

- `RESEND_API_KEY` — Resend API key
- `INQUIRY_TO_EMAIL` — destination inbox for inquiries
- `INQUIRY_FROM_EMAIL` — verified sender address in Resend

Also required: `DATABASE_URL`, `JWT_SECRET`. Optional: `OPENAI_API_KEY` / `OPENAI_MODEL` for AI itinerary personalization.

## Routes

- Public site: `/`
- Hidden admin login: `/portal/login`
- Admin dashboard: `/portal/dashboard`

## Railway Deployment

- Provision a PostgreSQL database and set `DATABASE_URL`.
- Set all env vars from `.env.example`.
- Run `npm run prisma:migrate` to apply the `MediaFile` table migration.
- To move existing Supabase-hosted images into Postgres: `npm run migrate:images -- --dry-run` then `npm run migrate:images`.
- Build command: `npm run build`
- Start command: `npm run start`
