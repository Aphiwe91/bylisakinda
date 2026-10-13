/**
 * AP Global Organics — Yoco payment Worker (Cloudflare Workers).
 *
 * The browser never sees the Yoco secret key. This Worker:
 *   1. validates the cart sent by the storefront,
 *   2. recomputes the total from its own price sheet (prices.json),
 *   3. creates a Yoco Checkout session and returns the redirectUrl.
 *
 * Routes
 *   GET  /api/health          -> { ok, mode }
 *   POST /api/checkout        -> { redirectUrl, checkoutId, amount, mode }
 *   POST /api/yoco/webhook    -> verifies the Svix signature and logs the event
 *
 * Required secrets / vars (see worker/README.md):
 *   YOCO_SECRET_KEY    sk_test_... (scaffold) | sk_live_... (production)
 *   YOCO_WEBHOOK_SECRET  whsec_... (optional, to verify webhooks)
 *   SITE_URL           https://aporganics.online
 *   ALLOWED_ORIGINS    comma-separated
 *   DELIVERY_FEE_CENTS flat delivery fee under the free-delivery threshold (default 0)
 */

import prices from "./prices.json";

const FREE_DELIVERY_CENTS = 50000; // R500.00
const SUBSCRIBE_DISCOUNT = 0.12;   // Subscribe & Save 12%
const YOCO_API = "https://payments.yoco.com/api/checkouts";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (url.pathname === "/api/health") {
        return json({ ok: true, mode: keyMode(env), currency: "ZAR" }, 200, cors);
      }
      if (url.pathname === "/api/checkout" && request.method === "POST") {
        if (!originAllowed(origin, env)) {
          return json({ error: "Origin not allowed" }, 403, cors);
        }
        return await createCheckout(request, env, cors);
      }
      if (url.pathname === "/api/yoco/webhook" && request.method === "POST") {
        return await handleWebhook(request, env);
      }
      return json({ error: "Not found" }, 404, cors);
    } catch (err) {
      return json({ error: "Server error", detail: String(err && err.message || err) }, 500, cors);
    }
  },
};

// ---------------------------------------------------------------- checkout

async function createCheckout(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400, cors);
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return json({ error: "Cart is empty" }, 400, cors);

  const priced = [];
  let subtotalCents = 0;

  for (const item of items) {
    const name = String(item.name || "");
    const size = parseInt(item.size, 10) || 80;
    const qty = Math.min(99, Math.max(1, parseInt(item.qty, 10) || 1));

    const sheet = prices.products[name];
    if (!sheet) return json({ error: "Unknown product: " + name }, 400, cors);
    const unit = size === 200 ? sheet.p200 : sheet.p80;
    if (typeof unit !== "number") {
      return json({ error: "Product not available in " + size + "g: " + name }, 400, cors);
    }
    const unitCents = Math.round(unit * 100);
    subtotalCents += unitCents * qty;
    priced.push({ name, size, qty, unitCents });
  }

  // Bundles (if the storefront ever posts one directly, priced from the sheet)
  if (Array.isArray(body.bundles)) {
    for (const b of body.bundles) {
      const price = prices.bundles[String(b.name || "")];
      if (typeof price !== "number") return json({ error: "Unknown bundle: " + b.name }, 400, cors);
      const qty = Math.min(99, Math.max(1, parseInt(b.qty, 10) || 1));
      const unitCents = Math.round(price * 100);
      subtotalCents += unitCents * qty;
      priced.push({ name: String(b.name), size: 0, qty, unitCents, bundle: true });
    }
  }

  const subscribe = body.subscribe === true;
  const discountCents = subscribe ? Math.round(subtotalCents * SUBSCRIBE_DISCOUNT) : 0;
  const goodsCents = subtotalCents - discountCents;

  const deliveryFee = parseInt(env.DELIVERY_FEE_CENTS || "0", 10) || 0;
  const deliveryCents = goodsCents >= FREE_DELIVERY_CENTS ? 0 : deliveryFee;

  const amount = goodsCents + deliveryCents;
  if (amount < 200) {
    return json({ error: "Yoco requires a minimum of R2.00" }, 400, cors);
  }

  const site = (env.SITE_URL || "https://aporganics.online").replace(/\/$/, "");
  const customer = body.customer || {};

  const payload = {
    amount,
    currency: "ZAR",
    successUrl: site + "/?payment=success",
    cancelUrl: site + "/?payment=cancelled",
    failureUrl: site + "/?payment=failed",
    metadata: {
      source: "aporganics.online",
      customerName: String(customer.name || "").slice(0, 120),
      customerEmail: String(customer.email || "").slice(0, 160),
      customerPhone: String(customer.phone || "").slice(0, 40),
      subscribe: String(subscribe),
      deliveryCents: String(deliveryCents),
      itemCount: String(priced.reduce((n, p) => n + p.qty, 0)),
    },
    subtotalAmount: subtotalCents,
    totalDiscount: discountCents,
    lineItems: priced.map((p) => ({
      displayName: p.bundle ? p.name : `${p.name} (${p.size}g pouch)`,
      quantity: p.qty,
      pricingDetails: { price: p.unitCents },
    })),
  };

  const res = await fetch(YOCO_API, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.YOCO_SECRET_KEY,
      "Content-Type": "application/json",
      "Idempotency-Key": body.cartId ? String(body.cartId).slice(0, 64) : crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return json({
      error: "Yoco rejected the checkout",
      status: res.status,
      yoco: data,
    }, 502, cors);
  }

  return json({
    redirectUrl: data.redirectUrl,
    checkoutId: data.id,
    amount: data.amount,
    mode: data.processingMode || keyMode(env),
  }, 200, cors);
}

// ---------------------------------------------------------------- webhook

async function handleWebhook(request, env) {
  const raw = await request.text();
  const secret = env.YOCO_WEBHOOK_SECRET;

  if (secret) {
    const ok = await verifySvix(request.headers, raw, secret);
    if (!ok) return new Response("Invalid signature", { status: 401 });
  }

  let event = {};
  try { event = JSON.parse(raw); } catch { /* ignore */ }
  console.log("yoco webhook", event.type || "unknown", JSON.stringify(event.payload || {}).slice(0, 500));

  // Fulfilment hook: plug in email/WhatsApp/admin notification here.
  return new Response("ok", { status: 200 });
}

async function verifySvix(headers, payload, secret) {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!id || !timestamp || !signatures) return false;

  const base = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes;
  try { keyBytes = Uint8Array.from(atob(base), (c) => c.charCodeAt(0)); }
  catch { return false; }

  const key = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign(
    "HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return signatures.split(" ").some((part) => {
    const sig = part.includes(",") ? part.split(",")[1] : part;
    return timingSafeEqual(sig, expected);
  });
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// ---------------------------------------------------------------- helpers

function keyMode(env) {
  return String(env.YOCO_SECRET_KEY || "").startsWith("sk_live_") ? "live" : "test";
}

function originAllowed(origin, env) {
  if (!origin) return true; // same-origin / curl
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowed.length) return true;
  return allowed.includes(origin);
}

function corsHeaders(origin, env) {
  const allow = originAllowed(origin, env) && origin ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...(cors || {}) },
  });
}
