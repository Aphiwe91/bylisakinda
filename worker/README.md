# AP Global Organics — Yoco payment backend

The payment API runs **inside the same Cloudflare Worker that serves the website**
(Worker `round-rain-b4e8`, configured by the `wrangler.toml` in the site root).
The browser never sees the Yoco secret key: the storefront posts the cart to
`/api/checkout`, this script recomputes the total from `src/prices.json` and then
asks Yoco to create a Checkout session. The customer is redirected to Yoco's
hosted page to pay.

## Routes

| Route | Purpose |
|---|---|
| `GET /api/health` | `{ ok, mode }` — confirms the API is up and whether it is in `test` or `live` mode |
| `POST /api/checkout` | Validates the cart, recomputes the total, creates a Yoco checkout, returns `redirectUrl` |
| `POST /api/yoco/webhook` | Verifies the Svix signature and logs payment events (fulfilment hook) |

Only `/api/*` is handled by this script (`run_worker_first = ["/api/*"]` in the
site `wrangler.toml`); every other path is served as a static asset, so the
storefront is unaffected.

Amounts are recomputed server-side from `src/prices.json`, so a tampered browser
cart cannot change what the customer is charged.

## Deploy

Run these from the **site root** (the folder containing `wrangler.toml`):

```bash
# 1. Store the Yoco secret keys (never commit them).
npx wrangler secret put YOCO_SECRET_KEY      # paste sk_test_...  (then sk_live_... when live)
npx wrangler secret put YOCO_WEBHOOK_SECRET  # paste whsec_...    (optional, for webhooks)

# 2. Ship it.
npx wrangler deploy
```

No DNS or route changes are needed: the Worker already owns the
`aporganics.online` Custom Domain, so the API is served from the same origin at
`https://aporganics.online/api/*`.

### Local testing

```bash
npx wrangler dev        # from the site root; serves assets + /api on :8787
```

`js/pay.js` automatically targets `http://localhost:8787` on localhost and the
same-origin `/api` everywhere else.

## Register the webhook (optional but recommended)

In the Yoco app: Sales → e-Commerce integrations → Checkout API → Webhooks, point
it at `https://aporganics.online/api/yoco/webhook`, then store the `whsec_...`
value with `npx wrangler secret put YOCO_WEBHOOK_SECRET`.

## Add the domain in Yoco

In the Yoco app: Sales → e-Commerce integrations → Checkout API → *How to
connect* → **Verified domains** → add `aporganics.online`. Live keys unlock once
the domain is verified.

## Configuration (`wrangler.toml` → `[vars]`)

| Var | Meaning |
|---|---|
| `SITE_URL` | Public site URL used for Yoco success/cancel/failure redirects |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call `/api/checkout` |
| `DELIVERY_FEE_CENTS` | Flat delivery fee (in cents) charged below R500; `0` to disable |

## Keeping prices in sync

`src/prices.json` is generated from the site's single source of truth:

```bash
python3 tools/gen_prices.py     # from the site root
```

Re-run it whenever `js/products.js` prices change, then `npx wrangler deploy`.

## Test cards

Yoco test mode accepts card `4111 1111 1111 1111` with any future expiry and any
3-digit CVC. Test payments never touch real money and never appear in payouts.
