# Notes Vault (Next.js Migration)

This folder contains the migrated version of your PHP project with Supabase-backed data access, improved security, cleaner structure, and upgraded UI/UX.

## Migrated Features

- Register and login with role support (user/admin)
- Secure logout using HttpOnly cookies
- Forgot password with OTP verification and expiry
- New password flow via short-lived reset token
- Notes CRUD for users
- Admin dashboard with stats
- Admin user management (toggle role, delete user)
- Admin note comments

## Stack

- Next.js 16 App Router (TypeScript)
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) for database access
- jose for JWT cookies
- bcryptjs for password and OTP hashing
- zod for request validation
- nodemailer for OTP emails

## Environment Setup

1. Copy .env.example to .env.local
2. Fill in real values for Supabase, JWT secret, and SMTP

Required env vars:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- (or) NEXT_PUBLIC_SUPABASE_ANON_KEY
- JWT_SECRET
- ADMIN_REGISTRATION_CODE

Optional for OTP email delivery:

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM

## Database Schema

This app uses the following tables:

- `user`
- `tasks`

And also reuses existing reset columns in `user`:

- otp
- attemtps
- expiry

## Run

- npm install
- npm run dev

Open http://localhost:3000

## Quality Checks

- npm run lint
- npm run build

Both are passing in this migration.
