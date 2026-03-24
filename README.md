# Cricket Tour Sri Lanka

One-page tourism + cricket package website with hidden admin portal, inquiry emails, and editable content.

## Stack

- Next.js (App Router)
- Prisma + PostgreSQL
- Supabase Storage (image uploads)
- SMTP via Nodemailer

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

## Routes

- Public site: `/`
- Hidden admin login: `/portal/login`
- Admin dashboard: `/portal/dashboard`

## Railway Deployment

- Provision a PostgreSQL database and set `DATABASE_URL`.
- Set all env vars from `.env.example`.
- Ensure Supabase bucket is public (or serve signed URLs).
- Build command: `npm run build`
- Start command: `npm run start`
