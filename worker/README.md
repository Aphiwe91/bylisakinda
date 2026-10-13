# AP Global Organics — Yoco payment Worker

A tiny Cloudflare Worker that creates Yoco Checkout sessions for the storefront.
It exists so the **Yoco secret key never reaches the browser**: the page posts the
cart here, the Worker recomputes the total from `src/prices.json` and calls Yoco.

## What it does

| Route | Purpose |
|---|---|
| `GET /api/health` | `{ ok, mode }` — confirms the Worker is up and whether it is in `test` or `live` mode |
| `POST /api/checkout` | Validates the cart, recomputes the total, creates a Yoco checkout, returns `redirectUrl` |
| `POST /api/yoco/webhook` | Verifies the Svix signature and logs payment events (fulfilment hook) |

Amounts are recomputed server-side from `src/prices.json`, so a tampered browser
cart cannot change what the customer is charged.

## Setup

1. **Install Wrangler** (Cloudflare's CLI):

   ```bash
   cd worker
   npm install
   npx wrangler login          # opens a browser once
   ```

2. **Set the Yoco secret key** (never commit it):

   ```bash
   # Scaffold with Yoco's public test key:
   npx wrangler secret put YOCO_SECRET_KEY
   #   paste: sk_test_<your test secret key>

   # Before going live, replace it with your live key:
   npx wrangler secret put YOCO_SECRET_KEY
   #   paste: sk_live_<your live secret key>
   ```

3. **Register the webhook** (optional but recommended) so you can confirm
   payments and fulfil orders:

   ```bash
   npx wrangler secret put YOCO_WEBHOOK_SECRET
   #   paste the whsec_... value Yoco shows when you create the webhook
   ```

   Then in the Yoco app (Sales → e-Commerce integrations → Checkout API →
   Webhooks) point the webhook at
   `https://aporganics.online/api/yoco/webhook`.

4. **Add the domain in Yoco.** In the Yoco app: Sales → e-Commerce integrations
   → Checkout API → *How to connect* → **Verified domains** → add
   `aporganics.online`. Live keys unlock once the domain is verified.

5. **Deploy:**

   ```bash
   npx wrangler deploy
   ```

   Then route `aporganics.online/api/*` at the Worker (uncomment `[routes]` in
   `wrangler.toml`, or add a DNS record in Cloudflare). For local testing use
   `npx wrangler dev` — it prints a `http://localhost:8787` URL; set that as the
   Worker URL in the storefront (see below).

## Configuration (`wrangler.toml` → `[vars]`)

| Var | Meaning |
|---|---|
| `SITE_URL` | Public site URL used for Yoco success/cancel/failure redirects |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call `/api/checkout` |
| `DELIVERY_FEE_CENTS` | Flat delivery fee (in cents) charged below R500; `0` to disable |

## Keeping prices in sync

`src/prices.json` is generated from the site's single source of truth:

```bash
cd ..            # site root
python3 tools/gen_prices.py
```

Re-run it whenever `js/products.js` prices change, then `wrangler deploy`.

## Test cards

Yoco test mode accepts card `4111 1111 1111 1111` with any future expiry and any
3-digit CVC. Test payments never touch real money and never appear in payouts.
