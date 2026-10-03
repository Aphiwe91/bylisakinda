/* AP Global Organics — store front-end.
   Vanilla JS. Depends on PRODUCTS (js/products.js) and Bootstrap 5 (modal).
   TODO: replace WHATSAPP_NUMBER with the real business WhatsApp number. */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "27000000000"; // placeholder — replace with the real number
  var FREE_DELIVERY = 500;             // free doorstep delivery over R500
  var SUBSCRIBE_DISCOUNT = 0.12;       // Subscribe & Save 12%

  // ---------- helpers ----------
  function money(n) { return "R" + n.toFixed(2); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byName(name) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].name === name) return PRODUCTS[i];
    return null;
  }
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }

  var toastEl;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "ago-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function waLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast(okMsg); },
        function () { fallbackCopy(text, okMsg); });
    } else fallbackCopy(text, okMsg);
  }
  function fallbackCopy(text, okMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showToast(okMsg); }
    catch (e) { showToast("Copy failed — please copy manually"); }
    document.body.removeChild(ta);
  }

  // ---------- cart (localStorage) ----------
  var cart = loadJSON("ago_cart", []);

  function addToCart(name, qty) {
    var p = byName(name);
    if (!p) return;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name) { cart[i].qty = Math.min(99, cart[i].qty + qty); saveCart(); return; }
    }
    cart.push({ name: name, qty: Math.min(99, qty), size: 80, price: p.p80 });
    saveCart();
  }

  function saveCart() {
    localStorage.setItem("ago_cart", JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    var items = document.getElementById("cart-items");
    if (!items) return;
    var count = 0, total = 0;
    items.innerHTML = "";
    if (!cart.length) {
      items.innerHTML = '<li class="list-group-item d-flex justify-content-between lh-sm" id="cart-empty">' +
        '<div><h6 class="my-0">Your cart is empty</h6>' +
        '<small class="text-body-secondary">Add products from the shelves below</small></div></li>';
    } else {
      cart.forEach(function (item, i) {
        count += item.qty;
        total += item.qty * item.price;
        var li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between lh-sm align-items-center";
        li.innerHTML =
          "<div><h6 class=\"my-0\">" + esc(item.name) + "</h6>" +
          "<small class=\"text-body-secondary\">" + item.qty + " × 80g pouch @ " + money(item.price) + "</small></div>" +
          "<div class=\"d-flex align-items-center gap-2\"><span>" + money(item.qty * item.price) + "</span>" +
          "<button class=\"btn btn-sm btn-link text-danger p-0 cart-remove\" data-i=\"" + i + "\" aria-label=\"Remove " + esc(item.name) + "\">×</button></div>";
        items.appendChild(li);
      });
    }
    document.getElementById("cart-count").textContent = count;
    document.getElementById("cart-total").textContent = money(total);
    var note = document.getElementById("cart-delivery-note");
    if (total >= FREE_DELIVERY) note.textContent = "Free doorstep delivery unlocked — anywhere in South Africa.";
    else if (total > 0) note.textContent = "Add " + money(FREE_DELIVERY - total) + " more for free doorstep delivery (over R500).";
    else note.textContent = "";
  }

  document.getElementById("cart-items").addEventListener("click", function (e) {
    var btn = e.target.closest(".cart-remove");
    if (!btn) return;
    cart.splice(parseInt(btn.getAttribute("data-i"), 10), 1);
    saveCart();
  });

  document.getElementById("cart-checkout").addEventListener("click", function () {
    if (!cart.length) { showToast("Your cart is empty — add a product first"); return; }
    var msg = "Order — AP Global Organics\n\n";
    var total = 0;
    cart.forEach(function (item) {
      msg += "• " + item.qty + "× " + item.name + " (80g pouch) — " + money(item.qty * item.price) + "\n";
      total += item.qty * item.price;
    });
    msg += "\nTotal: " + money(total) + "\n";
    msg += "Delivery: " + (total >= FREE_DELIVERY ? "free doorstep delivery" : "calculated at checkout") + "\n";
    msg += "Please confirm availability and delivery time.";
    window.open(waLink(msg), "_blank");
  });

  // ---------- product cards: add to cart, wishlist, quick view ----------
  var wishlist = new Set(loadJSON("ago_wishlist", []));

  document.addEventListener("click", function (e) {
    // Add to Cart button on a product card
    var cartBtn = e.target.closest(".btn-cart");
    if (cartBtn) {
      e.preventDefault();
      var card = cartBtn.closest(".product-item");
      var name = card.querySelector("h3").textContent.trim();
      var qtyEl = card.querySelector(".quantity");
      var qty = Math.max(1, parseInt(qtyEl && qtyEl.value, 10) || 1);
      addToCart(name, qty);
      showToast("Added to cart — " + name + " ×" + qty);
      return;
    }
    // Wishlist heart
    var heart = e.target.closest(".button-area a:not(.btn-cart)");
    if (heart) {
      e.preventDefault();
      var hCard = heart.closest(".product-item");
      var hName = hCard.querySelector("h3").textContent.trim();
      if (wishlist.has(hName)) {
        wishlist.delete(hName);
        heart.classList.remove("text-danger");
        showToast("Removed from wishlist — " + hName);
      } else {
        wishlist.add(hName);
        heart.classList.add("text-danger");
        showToast("Saved to wishlist — " + hName);
      }
      localStorage.setItem("ago_wishlist", JSON.stringify(Array.from(wishlist)));
      return;
    }
    // Quick view: product photo or product name
    var figLink = e.target.closest(".product-item figure a");
    var h3 = e.target.closest(".product-item h3");
    if (figLink || h3) {
      e.preventDefault();
      var qCard = (figLink || h3).closest(".product-item");
      openProduct(qCard.querySelector("h3").textContent.trim());
    }
  });

  // restore wishlist heart states
  document.querySelectorAll(".product-item").forEach(function (card) {
    var name = card.querySelector("h3").textContent.trim();
    if (wishlist.has(name)) {
      var heart = card.querySelector(".button-area a:not(.btn-cart)");
      if (heart) heart.classList.add("text-danger");
    }
  });

  // ---------- quick-view modal ----------
  var modal = null, modalProduct = null;
  function openProduct(name) {
    var p = byName(name);
    if (!p) return;
    modalProduct = p;
    document.getElementById("pm-img").src = p.photo;
    document.getElementById("pm-img").alt = p.name;
    document.getElementById("pm-name").textContent = p.name;
    document.getElementById("pm-use").textContent = p.use;
    document.getElementById("pm-pack").textContent = p.pack_g + "g bulk pack — R" + p.pack_price.toFixed(2);
    document.getElementById("pm-cost").textContent = "R" + (p.pack_price / p.pack_g).toFixed(4) + " /g";
    document.getElementById("pm-p80").textContent = money(p.p80);
    document.getElementById("pm-p200").textContent = money(p.p200);
    document.getElementById("pm-p500").textContent = money(p.p500);
    if (!modal) modal = new bootstrap.Modal(document.getElementById("product-modal"));
    modal.show();
  }
  document.getElementById("pm-add").addEventListener("click", function () {
    if (!modalProduct) return;
    addToCart(modalProduct.name, 1);
    showToast("Added to cart — " + modalProduct.name);
    modal.hide();
  });

  // ---------- search + category filter ----------
  var searchQ = "", catFilter = "", scenarioSet = null;

  function matches(card) {
    var name = card.querySelector("h3").textContent.trim();
    var p = byName(name);
    if (searchQ && name.toLowerCase().indexOf(searchQ) === -1) return false;
    if (catFilter && (!p || p.cat !== catFilter)) return false;
    if (scenarioSet && !scenarioSet.has(name)) return false;
    return true;
  }

  function applyFilters() {
    document.querySelectorAll(".product-grid, .swiper").forEach(function (container) {
      var sectionVisible = 0;
      container.querySelectorAll(".product-item").forEach(function (card) {
        var ok = matches(card);
        // grid cards hide via their .col wrapper; swiper slides hide directly
        var wrap = card.closest(".col") || card;
        wrap.style.display = ok ? "" : "none";
        if (ok) sectionVisible++;
      });
      var msg = container.nextElementSibling;
      if (msg && msg.classList && msg.classList.contains("no-results")) {
        msg.style.display = sectionVisible === 0 ? "" : "none";
      }
    });
    // keep swiper carousels in sync after slides are hidden
    document.querySelectorAll(".swiper").forEach(function (el) {
      if (el.swiper) { try { el.swiper.update(); } catch (e) {} }
    });
  }

  function firstVisibleContainer() {
    var first = null;
    document.querySelectorAll(".product-grid, .swiper").forEach(function (c) {
      if (first) return;
      var any = false;
      c.querySelectorAll(".product-item").forEach(function (card) {
        var wrap = card.closest(".col") || card;
        if (wrap.style.display !== "none") any = true;
      });
      if (any) first = c;
    });
    return first;
  }

  var searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    searchQ = searchInput.value.trim().toLowerCase();
    applyFilters();
  });
  var searchForm = document.getElementById("search-form");
  if (searchForm) searchForm.addEventListener("submit", function (e) { e.preventDefault(); });

  var catSelect = document.getElementById("category-filter");
  catSelect.addEventListener("change", function () {
    catFilter = catSelect.value;
    applyFilters();
  });

  // "no matches" note under each product grid and carousel
  function insertNoResults(container) {
    var d = document.createElement("div");
    d.className = "no-results text-center py-5 text-body-secondary";
    d.style.display = "none";
    d.textContent = "No products match — try a different search term or clear the filters.";
    container.parentNode.insertBefore(d, container.nextSibling);
  }
  document.querySelectorAll(".product-grid").forEach(insertNoResults);
  // only carousels that actually contain products get a note
  document.querySelectorAll(".swiper").forEach(function (sw) {
    if (sw.querySelector(".product-item")) insertNoResults(sw);
  });

  // ---------- scenarios ----------
  document.querySelectorAll(".scenario-shop").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var names = btn.getAttribute("data-products").split("|");
      var same = scenarioSet && names.every(function (n) { return scenarioSet.has(n); }) &&
        names.length === scenarioSet.size;
      scenarioSet = same ? null : new Set(names);
      document.querySelectorAll(".scenario-shop").forEach(function (b) {
        var active = b === btn && scenarioSet;
        b.classList.toggle("btn-dark", !!active);
        b.classList.toggle("btn-outline-dark", !active);
      });
      applyFilters();
      var firstMatch = firstVisibleContainer();
      if (firstMatch) firstMatch.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(same ? "Showing all products" : "Showing products for this scenario");
    });
  });
  document.getElementById("scenario-reset").addEventListener("click", function () {
    scenarioSet = null;
    searchQ = "";
    catFilter = "";
    searchInput.value = "";
    catSelect.value = "";
    document.querySelectorAll(".scenario-shop").forEach(function (b) {
      b.classList.remove("btn-dark");
      b.classList.add("btn-outline-dark");
    });
    applyFilters();
  });
  document.getElementById("wholesale-enquiry").addEventListener("click", function () {
    var msg = "Wholesale enquiry — AP Global Organics\n\n" +
      "I run a café / deli / bakery and would like:\n" +
      "• 1 kg and 5 kg bulk packs at 35–40% off retail RRP\n" +
      "• Co-branded 80g retail pouches for my shelf\n\n" +
      "Please send a wholesale price list and minimum order quantities.";
    window.open(waLink(msg), "_blank");
  });

  // ---------- order builder ----------
  var obSelect = document.getElementById("ob-product");
  PRODUCTS.forEach(function (p, i) {
    var o = document.createElement("option");
    o.value = i;
    o.textContent = p.name + " — " + money(p.p80) + " / 80g";
    obSelect.appendChild(o);
  });

  function obRecalc() {
    var p = PRODUCTS[parseInt(obSelect.value, 10) || 0];
    var size = parseInt(document.querySelector("input[name=\"ob-size\"]:checked").value, 10);
    var qty = Math.max(1, parseInt(document.getElementById("ob-qty").value, 10) || 1);
    var unit = p["p" + size];
    var subtotal = unit * qty;
    var subscribe = document.getElementById("ob-subscribe").checked;
    var discount = subscribe ? subtotal * SUBSCRIBE_DISCOUNT : 0;
    var total = subtotal - discount;

    var sizeNote = size === 500 ? " (best value)" : (size === 80 ? " (trial size)" : "");
    document.getElementById("ob-lines").innerHTML =
      "<div class=\"d-flex justify-content-between\"><span class=\"fw-semibold\">" + esc(p.name) + "</span>" +
      "<span>" + money(unit) + " × " + qty + "</span></div>" +
      "<div class=\"d-flex justify-content-between text-body-secondary\"><small>" + size + "g pouch" + sizeNote +
      "</small><small>" + money(subtotal) + "</small></div>";
    document.getElementById("ob-subtotal").textContent = money(subtotal);
    document.getElementById("ob-save-row").style.display = subscribe ? "" : "none";
    document.getElementById("ob-save").textContent = "−" + money(discount);
    document.getElementById("ob-total").textContent = money(total);

    var pct = Math.min(100, (total / FREE_DELIVERY) * 100);
    document.getElementById("ob-progress").style.width = pct + "%";
    var dMsg = document.getElementById("ob-delivery-msg");
    if (total >= FREE_DELIVERY) dMsg.textContent = "Free doorstep delivery unlocked.";
    else dMsg.textContent = "Add " + money(FREE_DELIVERY - total) + " more for free doorstep delivery (over R500).";

    var msg = "Order — AP Global Organics\n\n" +
      "• " + qty + "× " + p.name + " (" + size + "g pouch) @ " + money(unit) + " — " + money(subtotal) + "\n";
    if (subscribe) msg += "• Subscribe & Save 12% applied — " + money(discount) + " off\n";
    msg += "\nTotal: " + money(total) + "\n";
    msg += "Delivery: " + (total >= FREE_DELIVERY ? "free doorstep delivery" : "calculated at checkout") + "\n";
    if (subscribe) msg += "Subscription: monthly or bi-monthly, skip or cancel anytime.\n";
    msg += "Please confirm availability and delivery time.";
    document.getElementById("ob-whatsapp").href = waLink(msg);
  }

  obSelect.addEventListener("change", obRecalc);
  document.getElementById("ob-qty").addEventListener("input", obRecalc);
  document.getElementById("ob-subscribe").addEventListener("change", obRecalc);
  document.querySelectorAll("input[name=\"ob-size\"]").forEach(function (r) {
    r.addEventListener("change", obRecalc);
  });
  document.getElementById("ob-minus").addEventListener("click", function () {
    var q = document.getElementById("ob-qty");
    q.value = Math.max(1, (parseInt(q.value, 10) || 1) - 1);
    obRecalc();
  });
  document.getElementById("ob-plus").addEventListener("click", function () {
    var q = document.getElementById("ob-qty");
    q.value = Math.min(99, (parseInt(q.value, 10) || 1) + 1);
    obRecalc();
  });
  document.getElementById("ob-copy").addEventListener("click", function () {
    var p = PRODUCTS[parseInt(obSelect.value, 10) || 0];
    var size = document.querySelector("input[name=\"ob-size\"]:checked").value;
    var qty = document.getElementById("ob-qty").value;
    copyText("Order — AP Global Organics: " + qty + "× " + p.name + " (" + size + "g pouch), total " +
      document.getElementById("ob-total").textContent + ". Please confirm availability and delivery.",
      "Order summary copied");
  });
  document.getElementById("ob-whatsapp").addEventListener("click", function () {
    showToast("Opening WhatsApp with your order…");
  });

  // ---------- hero carousel ----------
  if (document.querySelector(".hero-carousel")) {
    new Swiper(".hero-carousel", {
      loop: true,
      speed: 700,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: ".hero-carousel .swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".hero-carousel .swiper-button-next",
        prevEl: ".hero-carousel .swiper-button-prev",
      },
    });
  }

  // ---------- init ----------
  renderCart();
  obRecalc();
})();
