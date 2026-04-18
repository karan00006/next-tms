# Notes Vault (Next.js Migration)

This folder contains the migrated version of your PHP project, keeping the same MySQL database tables and core behavior while improving security, structure, and UI/UX.

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
- mysql2 for database access
- jose for JWT cookies
- bcryptjs for password and OTP hashing
- zod for request validation
- nodemailer for OTP emails

## Environment Setup

1. Copy .env.example to .env.local
2. Fill in real values for database, JWT secret, and SMTP

Required env vars:

- DATABASE_URL
- JWT_SECRET
- ADMIN_REGISTRATION_CODE

Optional for OTP email delivery:

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM

## Database Compatibility

This app reuses the same existing tables from PHP:

- students
- crud_app

And also reuses existing reset columns in students:

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
