# PHP Project Audit (Findings)

## Critical

1. Hardcoded secrets in source
- Database credentials and admin code are hardcoded in db.php.
- SMTP username/password are hardcoded in reset-pass.php.
- Risk: full account and database compromise.

2. Password reset via GET and weak flow controls
- reset-pass.php and verify-otp.php use GET for sensitive operations.
- OTP verification state was not strongly session-bound.
- Risk: leakage via URLs/logs and reset misuse.

3. Missing CSRF on sensitive admin actions
- admin-mesage.php does not verify CSRF token.
- Risk: forged admin requests from third-party pages.

## High

4. Authorization gaps and insecure redirect input
- admin-mesage.php allows open redirect-like behavior via posted current-page.
- Risk: redirect abuse and trust boundary break.

5. Insecure secret handling and environment management
- No environment-based secret management.
- Risk: accidental commit of production credentials.

6. Session/cookie hardening not explicit
- No strict modern cookie strategy for auth.
- Risk: increased session theft impact.

## Medium

7. Data validation inconsistent
- Input sanitization/validation is uneven across forms.
- Risk: bad data quality and edge-case bypasses.

8. Error handling may expose internals
- Some database exceptions are surfaced to UI.
- Risk: information disclosure.

9. Weak maintainability
- Monolithic page scripts combine view + DB + auth checks.
- Risk: hard to test, easy regression.

## Migration Fixes Implemented in Next.js

- Secrets moved to environment variables (.env.local)
- API-first architecture with separated route handlers
- Role-aware auth with HttpOnly JWT cookies
- Strong request validation with zod
- OTP flow improved with expiry + attempt limits + reset token cookie
- Ownership checks for every note read/update/delete
- Admin-only routes enforced server-side
- Modernized UI with responsive, improved information hierarchy
- Lint and build checks passing
