/* AP Global Organics — Yoco card checkout.
   Posts the cart to the Yoco Worker (which holds the secret key) and redirects
   the customer to Yoco's hosted payment page. Depends on the cart written by
   js/store.js (localStorage key "ago_cart"). */
(function () {
  "use strict";

  // Worker base URL. Localhost dev points at `wrangler dev`; production uses the
  // same-origin /api/* route on aporganics.online.
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var cfg = window.AGO_PAY || {};
  var API_BASE = (cfg.workerUrl || (isLocal ? "http://localhost:8787" : "/api")).replace(/\/$/, "");

  function money(n) { return "R" + Number(n).toFixed(2); }

  function toast(msg) {
    var el = document.getElementById("ago-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ago-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function cart() {
    try { return JSON.parse(localStorage.getItem("ago_cart")) || []; }
    catch (e) { return []; }
  }

  // ---- payment result banner (?payment=success|cancelled|failed) ----
  function showResult() {
    var m = location.search.match(/[?&]payment=(success|cancelled|failed)/);
    if (!m) return;
    var state = m[1];
    var box = document.getElementById("pay-result");
    if (!box) return;
    var copy = {
      success: ["Payment received — thank you!", "We'll confirm your order and delivery on WhatsApp shortly.", "success"],
      cancelled: ["Payment cancelled", "Your cart is still saved — you can pay or order on WhatsApp any time.", "warning"],
      failed: ["Payment didn't go through", "No money was taken. Please try again or order on WhatsApp.", "danger"]
    }[state];
    box.className = "ago-result ago-result--" + copy[2];
    box.innerHTML = "<strong>" + copy[0] + "</strong><span>" + copy[1] + "</span>";
    box.hidden = false;
    if (state === "success") {
      try { localStorage.removeItem("ago_cart"); } catch (e) {}
      if (window.dispatchEvent) window.dispatchEvent(new Event("ago:cart-cleared"));
    }
    history.replaceState(null, "", location.pathname);
  }

  // ---- pay by card ----
  function payWithCard(btn) {
    var items = cart();
    if (!items.length) { toast("Your cart is empty — add a product first"); return; }

    var name = (document.getElementById("pay-name") || {}).value || "";
    var email = (document.getElementById("pay-email") || {}).value || "";
    var phone = (document.getElementById("pay-phone") || {}).value || "";

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast("Please enter a valid email for your receipt");
      var em = document.getElementById("pay-email");
      if (em) { em.focus(); em.classList.add("is-invalid"); }
      return;
    }

    var original = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.innerHTML = '<span class="ago-spinner" aria-hidden="true"></span> Starting secure payment…';

    fetch(API_BASE + "/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(function (i) { return { name: i.name, size: i.size || 80, qty: i.qty }; }),
        subscribe: false,
        cartId: "cart-" + (JSON.parse(localStorage.getItem("ago_cart_id") || '""') || (Date.now() + "-" + Math.random().toString(36).slice(2))),
        customer: { name: name, email: email, phone: phone }
      })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d.redirectUrl) {
          toast("Redirecting to Yoco…");
          window.location.href = res.d.redirectUrl;
          return;
        }
        throw new Error((res.d && (res.d.error || (res.d.yoco && res.d.yoco.message))) || "Payment could not start");
      })
      .catch(function (err) {
        console.error("Yoco checkout failed:", err);
        toast("Card payment unavailable right now — please order on WhatsApp");
        btn.disabled = false;
        btn.classList.remove("is-loading");
        btn.innerHTML = original;
        var wa = document.getElementById("cart-checkout");
        if (wa) wa.classList.add("ago-pulse");
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    showResult();
    var btn = document.getElementById("cart-pay");
    if (btn) btn.addEventListener("click", function () { payWithCard(btn); });

    var email = document.getElementById("pay-email");
    if (email) email.addEventListener("input", function () { email.classList.remove("is-invalid"); });
  });
})();
