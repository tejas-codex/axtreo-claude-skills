# Feature Intel — Reusable Research Patterns

Accumulated from `/feature-intel` pipeline runs. Each run appends new patterns via the
`PATTERN:` field in the worker return block.

**How to use:** The worker reads this file in Phase 0-A (fourth query, after codebase/Jira/Confluence).
Apply any patterns whose domain matches the current feature — skip the rest.

**How to add:** After a run, paste the `PATTERN:` value as a new entry below under the correct domain.

---

## AUTH Domain

### AUTH-001 — Rate-limit key design for OTP endpoints
Hash identifiers before storing as KV keys using plain SHA-256 (Web Crypto `subtle.digest`).
Key format (current implementation): `otp:email:{sha256(normalised_email)[0..32]}` + `otp:ip:{sha256(ip)[0..16]}`.
If migrating to HMAC-based key derivation (using POW_HMAC_SECRET), update both this pattern and `otp-rate-limiter.ts` together — never let docs and code diverge.
Industry default (Auth0, Clerk): 5 attempts per 15-min window. Axtreo can use same default.
Never expose attempt count in the error response body — return only "too many attempts, try again in X minutes".
Source: Email OTP brute-force feature run (2026-04-28)

### AUTH-002 — NIST SP 800-63B OTP thresholds
NIST §5.1.3.2: OTP TTL recommendation is 5 minutes maximum; 10 minutes is acceptable.
NIST §5.2.2: Max 10 failed attempts before lockout. Using 5 is stricter = better.
RATE_LIMIT_KV is already provisioned in wrangler.toml — zero new infra needed for auth rate limiting.
Source: Email OTP brute-force feature run (2026-04-28)

---

## SECURITY Domain

### SEC-001 — EU IP address GDPR treatment in KV storage
IP addresses stored in Cloudflare KV = personal data under GDPR Article 4(1).
Short retention (≤24h, e.g. rate-limit counters): pseudonymise (SHA-256/HMAC) + set KV TTL = window. No Article 30 entry required.
Purpose-limited longer retention (e.g. 90-day anomaly-detection in `anomaly-detector.ts`): permitted when (a) pseudonymisation applied, (b) TTL enforced, (c) access restricted to security path only, (d) documented in RoPA/Article 30 record with purpose and legal basis.
Never store indefinitely — TTL is mandatory regardless of retention window.
Source: Email OTP brute-force feature run (2026-04-28)

### SEC-002 — Auth endpoints need separate rate-limit buckets from CRUD
Auth endpoints (OTP, magic link, passkey) have attack profiles different from CRUD.
Rate-limit auth separately: tighter windows (5/15min) vs general API (100/15min).
RATE_LIMIT_KV supports multiple key namespaces — no contention between auth and CRUD buckets.
Source: Email OTP brute-force feature run (2026-04-28)

---

## INTEGRATION Domain

*(add after first INTEGRATION feature run)*

---

## CLOSE Domain

*(add after first CLOSE feature run)*

---

## RECON Domain

*(add after first RECON feature run)*

---

## METRICS Domain

*(add after first METRICS feature run)*

---

## AI Domain

*(add after first AI feature run)*

---

## Template for new entries

### {DOMAIN}-{NNN} — {pattern name}
{2–3 sentence description of the reusable finding — what was discovered, when it applies, what the right approach is.}
Source: {feature name} run ({YYYY-MM-DD})
