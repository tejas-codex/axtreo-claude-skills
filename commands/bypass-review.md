---
description: Adversarial / red-team review on a PR or current branch. Acts like an attacker — asks "how could a bad actor bypass this?" Looks for rate-limit bypass, auth bypass, replay, abuse paths.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Purpose

Where `/security-review` checks if the code follows defensive best practices, this command asks the inverse question: **"as an attacker, how do I break this?"**

Catches the kind of issues that pass static analysis because the code does what it says — the problem is what the code DOESN'T say. Missing rate limit. Missing replay protection. Missing tenant boundary on a cross-cutting helper. Bypass via an obscure code path the developer didn't think about.

This is a creative review. Output is a report of bypass scenarios — not auto-fix.

---

## Step 0 — Determine the change set

Same as `/qa-review` step 0.

---

## Step 1 — Map the attack surface

What did this change ADD to the attack surface?

- New unauthenticated route? Highest scrutiny.
- New endpoint that accepts a JSON body? What fields can the attacker control?
- New webhook receiver? Replay-protected?
- New form / file upload? Size limit? Content-type validation?
- New magic-link / password-reset / OTP flow? Token entropy and expiry?
- New "support" / "admin" / "operator" path? Privilege boundary?
- New `Math.random` / timestamp-based ID? Predictable?

For each surface added, write down the threat model: "an attacker who has X (e.g., a valid session for tenant A) wants to do Y (e.g., read tenant B's data)".

---

## Step 2 — Bypass scenarios (think like an attacker)

For every changed file, walk through these scenarios:

### 2a. Rate-limit bypass
- Per-IP only? → bypass via NAT / proxy farm / Tor.
- Per-account? → bypass via account creation if signup is rate-limited but not gated.
- Per-email? → bypass via email plus-addressing (`a+1@x.com`, `a+2@x.com`).
- Per-cookie? → bypass via clearing cookies between requests.
- Per-session? → bypass via creating multiple sessions.
- Sliding window vs fixed window? Fixed-window has burst-at-boundary attacks.

For new rate-limited endpoints, walk through "how would I send 1000 requests/sec without getting limited?"

### 2b. Authentication bypass
- New auth check pattern. Is the inverse path (when the check fails) actually denying? Log + 200 = bypass.
- "Trust the JWT" pattern: is the JWT signature actually verified? Is the algorithm pinned (no `alg: none`)?
- DEV_AUTH_BYPASS / debug headers: can these be set in production by request input? **BLOCKER**.
- Support-access grants: time-limited? Audit-logged? Scoped to a single tenant?
- "Read user from request" pattern: is it `req.user` (set by middleware) or `req.body.userId` (attacker-controlled)?
- Logout: does it invalidate ALL sessions or just the current cookie? An attacker who stole a token earlier could still use it.

### 2c. Replay attack
- New webhook receiver: is the webhook signature signed AND a nonce/timestamp checked? Without timestamp, an attacker who captures one webhook can replay it forever.
- New API call that triggers a state change: is there an idempotency key? Without one, network retries can double-charge / double-record.
- New auth token: short-lived? Refresh-token-rotated?

### 2d. Cross-tenant access (IDOR)
- New endpoint that takes an entity ID as input (`GET /api/customers/:id`). Does it verify the customer's `accountId` matches the session's `accountId`? An attacker who guesses another tenant's ID gets that data otherwise. **BLOCKER**.
- New helper function that fetches an entity by ID without requiring accountId: who calls it? Each caller must scope manually = future bug.
- Cross-tenant data in caches: is the cache key namespaced by accountId?

### 2e. Race conditions & TOCTOU
- "Check-then-act" patterns: read a value, decide based on it, write a new value. Between the read and write, an attacker could change the underlying state.
  - Example: check email isn't taken → register user. Two concurrent registrations with the same email both pass the check.
- Mitigation: unique DB constraints + handle the conflict.

### 2f. Time-of-check vs Time-of-use
- File upload: check size before processing, then process from a separate buffer. Attacker fills the buffer between check and process.
- Permission check: cache permissions, check cached version, do action. Attacker revokes permission between check and action.

### 2g. Server-Side Request Forgery (SSRF)
- New code that fetches a URL provided by user input?
- Even a URL provided indirectly (e.g., via a webhook config the user controls)?
- Attacker can make the server fetch `http://169.254.169.254/` (AWS metadata) or internal services.
- Fix: allow-list of permitted hosts, reject IP-literal URLs, block private IP ranges.

### 2h. CSRF
- New state-changing endpoint accepts cookie-only auth?
- SameSite=Strict cookies are CSRF-immune for top-level navigation but still need careful CORS.
- New endpoint with `credentials: 'include'`-style auth must verify Origin and have CSRF token or use SameSite=Strict.

### 2i. Resource exhaustion (DoS)
- Loops over user-controlled input without a max-length check?
- Recursive parsing / unbounded JSON depth?
- File upload without size limit or rate limit?
- Database query that scans full table on user-controlled filter? (No index, no LIMIT.)
- Regex with catastrophic backtracking on user input?

### 2j. Information leakage
- Different error messages for "user not found" vs "wrong password" → user enumeration.
- Different response times for success vs failure → timing oracle.
- New `console.log` of internal state → leaks via Worker logs.

---

## Step 3 — Prove or disprove each scenario

For each plausible bypass, write down:
- **Setup**: what the attacker has to start with.
- **Attack**: the exact sequence of requests / inputs.
- **Outcome**: what they gain.
- **Test**: how you'd confirm the vulnerability (curl, wrk, etc.).

If you can articulate a clear bypass path, it's a finding. If the code IS resilient, note WHY for future-you.

---

## Step 4 — Output the bypass review

```
## Adversarial Review — <PR or branch>

### Attack surface added
- <summary of new endpoints / inputs / privileged paths>

### Bypass scenarios (verified exploitable)
[Type | file:line] one-sentence scenario + impact + suggested mitigation

### Bypass scenarios (theoretical, low likelihood)
- ...

### Verified resilient
- <list of attacks attempted that the code defends against and why>

### Open questions for human review
- <scenarios where you can't tell from the diff alone — needs runtime testing or domain knowledge>
```

Save to `/tmp/bypass-review-$(date +%s).md`.

---

## Final report

```
Bypass review complete:
  Attack surface delta:    <N new endpoints / paths>
  Verified exploitable:    <N>
  Theoretical:             <N>
  Verified resilient:      <N>
  Report saved:            /tmp/bypass-review-<ts>.md
```

Any verified-exploitable Blocker = `❌ Do NOT push. Adversarial gate failed — exploitable bypass exists.`
Otherwise = `✅ Adversarial review clean — no exploitable bypass identified.`
