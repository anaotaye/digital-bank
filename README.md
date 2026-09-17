# Ann's Bank

A fullstack digital banking application built for the Backend training program by TS Academy (Hajime Cohort). Simulates a Nigerian fintech: customers onboard with BVN/NIN, get a bank account, send money to any account in the NIBSS simulator, and track their history.

## Stack

**Frontend:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · react-hook-form + Zod · SWR
**Backend:** Node.js · Express · TypeScript · MongoDB (Mongoose) · Zod validation
**Shared:** npm workspaces + a `@repo/shared` package for Zod schemas used by both sides
**Auth:** HTTP-only cookies with `SameSite=strict`
**External:** NIBSS by Phoenix simulated API

## Screens

Signup · Login · KYC seeding (BVN or NIN) · Account creation · Dashboard · Transfer flow (recipient → amount → confirm → result) · Transaction history · Transaction detail · Profile · Warm 404 / error pages

## Running locally

**Prerequisites:** Node.js 20+, MongoDB running locally (MongoDB Community + Compass, or an Atlas connection string).

```bash
# From repo root
npm install

# Backend env — copy the example and fill in your NIBSS credentials
cp apps/api/.env.example apps/api/.env
# Then edit apps/api/.env — you'll need to onboard your bank at
# https://nibssbyphoenix.onrender.com/api/fintech/onboard
# and paste the returned apiKey/apiSecret/bankCode/bankName

# Frontend env
cp apps/web/.env.local.example apps/web/.env.local

# Run both (concurrently)
npm run dev
```

Backend runs at `http://localhost:4000`, frontend at `http://localhost:3000`.

## Architecture

### Two systems talking

```
Customer → Ann's Bank (this app) → NIBSS by Phoenix (external)
```

Our backend is the fintech; NIBSS is the identity + settlement layer. Our own DB holds customers, ownership relationships, and transaction history. NIBSS is the source of truth for account balances and identity records.

### Key design decisions

**Cookie auth over JWT-in-localStorage.** HTTP-only cookies can't be read by JavaScript, closing the XSS token-theft vector. The token is set server-side on login/signup and cleared on logout; the frontend never touches it directly, and every request sends `credentials: 'include'`.

**"Record intent first" for transfers.** Before calling NIBSS's transfer endpoint, we write a `PENDING` transaction record to our DB. On NIBSS success we update to `SUCCESS` with the reference; on failure, `FAILED`. Every attempt gets a durable record even if NIBSS hangs mid-request.

**Data isolation via query filters, not response filtering.** Every DB query touching Transactions includes `ownerCustomerId: req.customer.id` in the filter — not as a post-fetch check. If a customer looks up a transaction they don't own, they get a 404 identical to "doesn't exist." Never a 403 (which would confirm the ID is real).

**Response shape normalization at the NIBSS wrapper layer.** NIBSS's endpoints return inconsistent shapes (`data` vs `response`, uppercase vs lowercase `kycType`, missing `bankName` fields). Rather than sprinkle defensive checks everywhere, all normalization happens in the endpoint wrappers in `apps/api/src/services/nibss/`. Consumers get one clean type per endpoint.

**Same Zod schemas on both sides of the wire.** `SignupSchema`, `TransferRequestSchema`, etc. live in `@repo/shared` and feed both the Express `validate` middleware and the react-hook-form resolver on the frontend. A validation rule changes in one place.

**Multi-step transfer as one component with state, not routed pages.** `/transfer` has four visual states (recipient → amount → confirm → result) but doesn't change route between them. State survives back navigation cleanly, no query-param dance.

### Known limitations & trade-offs

- **Only outgoing transactions are recorded.** We track what our customers initiate. Incoming credits from other banks land silently in NIBSS's balance — we don't detect them for our history. Real production would poll or accept webhooks; NIBSS by Phoenix offers neither.
- **The frontend sends the pre-verified recipient name to the transfer endpoint.** In production the backend would re-verify via name enquiry before initiating. For this scope we trust what the frontend already fetched, saving one NIBSS call per transfer.
- **No password reset or email verification.** Out of scope for a training project.
- **7-day JWT expiry, no refresh-token rotation.** Adequate for the scope; production would want short-lived access tokens with a rotating refresh token.
- **Profile page is read-only.** No PATCH endpoints for updating email or name.
- **Transactions created before the recipient-name feature show truncated account numbers instead of names.** New transactions are correct.

## Backend endpoints

| Method | Path                                     | Auth | Purpose                                              |
| ------ | ---------------------------------------- | ---- | ---------------------------------------------------- |
| POST   | /api/auth/signup                         | —    | Create customer, set auth cookie                     |
| POST   | /api/auth/login                          | —    | Verify credentials, set auth cookie                  |
| POST   | /api/auth/logout                         | —    | Clear auth cookie                                    |
| GET    | /api/me                                  | ✓    | Current customer                                     |
| POST   | /api/kyc/bvn                             | ✓    | Seed a BVN (via NIBSS `insertBvn`), link to customer |
| POST   | /api/kyc/nin                             | ✓    | Seed a NIN, link to customer                         |
| POST   | /api/account                             | ✓    | Create the customer's account (max 1 per customer)   |
| GET    | /api/account/balance                     | ✓    | Fetch balance live from NIBSS                        |
| GET    | /api/account/name-enquiry/:accountNumber | ✓    | Look up an account holder's name                     |
| POST   | /api/transfer                            | ✓    | Initiate transfer, record transaction                |
| GET    | /api/transactions                        | ✓    | Paginated list, filtered to the caller               |
| GET    | /api/transactions/:id                    | ✓    | Single transaction with fresh NIBSS status           |
| GET    | /api/transactions/:id/receipt            | ✓    | Transfer receipt, rendered as a PNG                  |

## Design system

Warm & personal identity — terracotta primary (`#C9522F`), warm greys, cream backgrounds, Fraunces (headings) + Instrument Sans (UI) + JetBrains Mono (numbers / IDs). Tokens live in `apps/web/app/globals.css` under `@theme` (Tailwind v4).

## Project layout

```
apps/
  api/    Express + Mongoose backend
  web/    Next.js App Router frontend
packages/
  shared/ Zod schemas shared by both apps
```

## Credits

Built by Anastasia Otaye ([@anaotaye](https://github.com/anaotaye)) for the TS Academy Hajime Cohort.
NIBSS by Phoenix API by Onyekachi Obute.
