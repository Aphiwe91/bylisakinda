#!/usr/bin/env python3
# AP Global Organics — store front-end test suite (33 assertions).
# Prereq: preview server running on http://localhost:8001/
#   cd . && nohup python3 -m http.server 8001 --bind :: > /tmp/organic-server.log 2>&1 &
# Run: python3 tests/store_test.py
# NOTE: Selenium Manager is broken in this environment — the test passes
# Service('/usr/bin/chromedriver') and binary_location='/usr/bin/chromium' explicitly.

import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

opts = Options()
opts.binary_location = "/usr/bin/chromium"
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-dev-shm-usage")
opts.add_argument("--window-size=1400,1000")
driver = webdriver.Chrome(service=Service("/usr/bin/chromedriver"), options=opts)

errors = []
driver.get("http://localhost:8001/")
wait = WebDriverWait(driver, 15)

def check(label, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + label + (" | " + str(detail) if detail != "" else ""))
    if not cond:
        errors.append(label)

# wait for store.js init, then clear the template preloader (fades on window.load, slow in headless)
wait.until(lambda d: d.execute_script(
    "return typeof PRODUCTS !== 'undefined' && typeof BUNDLES !== 'undefined' && document.getElementById('cart-count') !== null"))
driver.execute_script("""
  var w = document.querySelector('.preloader-wrapper');
  if (w) w.remove();
  document.body.classList.remove('preloader-site');
  document.documentElement.style.scrollBehavior = 'auto';  // instant scroll for headless clicks
""")

# JS-based state: Selenium .text returns "" for off-screen swiper slides
def page_state():
    return driver.execute_script("""
      return Array.from(document.querySelectorAll('.product-item')).map(function(c){
        var wrap = c.closest('.col') || c;
        return {name: c.querySelector('h3').textContent.trim(),
                visible: wrap.style.display !== 'none' && c.style.display !== 'none'};
      });
    """)

def txt(id_):
    return driver.execute_script(
        "return document.getElementById('" + id_ + "').textContent.trim()")

def visible_names():
    return [c["name"] for c in page_state() if c["visible"]]

# 1. data layer
check("PRODUCTS loaded", driver.execute_script("return PRODUCTS.length") == 31)
check("BUNDLES loaded", driver.execute_script("return BUNDLES.length") == 3)
check("no-results notes (1 grid + 3 carousels, not the hero swiper)",
      driver.execute_script("return document.querySelectorAll('.no-results').length") == 4)

# 2. card inventory
state = page_state()
names = [c["name"] for c in state]
check("37 product cards on page", len(state) == 37, len(state))
check("all cards have names", all(names), [n for n in names if not n][:3])

# 3. search filter
si = driver.find_element(By.ID, "search-input")
si.clear()
si.send_keys("turmeric")
vis = visible_names()
expected = [n for n in names if "turmeric" in n.lower()]
check("search 'turmeric' filters correctly", sorted(vis) == sorted(expected), f"{len(vis)} visible, expected {len(expected)}")
si.clear()
driver.execute_script("document.getElementById('search-input').dispatchEvent(new Event('input'))")
check("clearing search restores all", len(visible_names()) == 37, len(visible_names()))

# 4. category filter
cs = driver.find_element(By.ID, "category-filter")
cs.find_element(By.XPATH, "//option[.='Herbs']").click()
vis = visible_names()
herbs = ["Thyme", "Oregano", "Italian Herbs", "Bay Leaves", "Dried Parsley", "Basil"]
expected_herbs = [n for n in names if any(h in n for h in herbs)]
check("category 'Herbs' filters correctly", sorted(vis) == sorted(expected_herbs), f"{len(vis)} visible, expected {len(expected_herbs)}")
cs.find_element(By.XPATH, "//option[@value='']").click()
check("category reset restores all", len(visible_names()) == 37)

# 5. add to cart (first grid card — button-area is now always visible)
first_name = driver.execute_script(
    "return document.querySelector('.product-grid .product-item h3').textContent.trim()")
driver.find_element(By.CSS_SELECTOR, ".product-grid .btn-cart").click()
check("add to cart updates badge", txt("cart-count") == "1")
stored = driver.execute_script("return JSON.parse(localStorage.getItem('ago_cart') || '[]')")
check("cart persisted to localStorage", len(stored) == 1 and stored[0]["name"] == first_name, stored)

# 6. quick view
driver.find_element(By.CSS_SELECTOR, ".product-grid .product-item figure a").click()
wait.until(EC.visibility_of_element_located((By.ID, "product-modal")))
check("quick-view modal opens", driver.find_element(By.ID, "pm-name").text == first_name)
check("quick-view shows 80g price", driver.find_element(By.ID, "pm-p80").text.startswith("R"))
driver.find_element(By.ID, "pm-add").click()
wait.until(EC.invisibility_of_element_located((By.ID, "product-modal")))
check("quick-view add increments cart", txt("cart-count") == "2")
check("cart total computed", txt("cart-total").startswith("R"))

# 7. order builder — the 80g/200g/500g pills were removed (commit 5f3a9a7) and left a
#    hidden ob-size=80 input, so pouch size is fixed at 80g. #ob-subscribe is a hidden
#    input too: store.js reads it via .checked, so drive it with checked + change event.
check("builder default (80g x1)", txt("ob-total") == "R27.83")
driver.find_element(By.ID, "ob-plus").click()
check("builder qty 2", txt("ob-total") == "R55.66")
driver.find_element(By.ID, "ob-minus").click()
check("builder qty back to 1", txt("ob-total") == "R27.83")

driver.execute_script(
    "var s = document.getElementById('ob-product'); s.value = '2'; s.dispatchEvent(new Event('change'));")
p2 = driver.execute_script("return PRODUCTS[2]")
check("builder product switch rewrites summary", p2["name"] in driver.find_element(By.ID, "ob-lines").text, p2["name"])
check("builder total = selected product 80g",
      txt("ob-total") == driver.execute_script("return 'R' + PRODUCTS[2].p80.toFixed(2)"), txt("ob-total"))

driver.execute_script(
    "var c = document.getElementById('ob-subscribe'); c.checked = true; c.dispatchEvent(new Event('change'));")
check("builder subscribe -12%",
      txt("ob-total") == driver.execute_script("return 'R' + (PRODUCTS[2].p80 * 0.88).toFixed(2)"), txt("ob-total"))
check("subscribe discount row visible",
      driver.find_element(By.ID, "ob-save-row").value_of_css_property("display") != "none")

driver.execute_script("var q = document.getElementById('ob-qty'); q.value = 99; q.dispatchEvent(new Event('input'));")
check("builder free-delivery note at R500+", "Free doorstep delivery unlocked" in txt("ob-delivery-msg"),
      txt("ob-delivery-msg"))

driver.execute_script("""
  var c = document.getElementById('ob-subscribe'); c.checked = false; c.dispatchEvent(new Event('change'));
  var q = document.getElementById('ob-qty'); q.value = 1; q.dispatchEvent(new Event('input'));
""")
check("builder resets to 80g x1", txt("ob-total") == "R17.14", txt("ob-total"))

# the only order CTA left in the markup is the floating WhatsApp button (no ob-whatsapp,
# no cart-checkout — both were dropped along with the radios)
check("whatsapp ORDER NOW CTA",
      driver.find_element(By.ID, "floating-whatsapp").get_attribute("href").startswith("https://wa.me/"))

# 8. scenario filter
driver.find_element(By.CSS_SELECTOR, ".scenario-shop").click()
vis = visible_names()
expected_scenario = [n for n in names if n in ("Ashwagandha Powder (Indian Ginseng)", "Moringa Powder")]
check("scenario filter shows only scenario products", sorted(vis) == sorted(expected_scenario), f"{len(vis)} visible")
driver.find_element(By.ID, "scenario-reset").click()
check("scenario reset shows all", len(visible_names()) == 37, len(visible_names()))

# 9. delivery note appears at R500+ (20x ashwagandha 80g = R556.60)
driver.execute_script("document.querySelector('.product-grid .quantity').value = 20;")
driver.find_element(By.CSS_SELECTOR, ".product-grid .btn-cart").click()
note = driver.find_element(By.ID, "cart-delivery-note").text
check("free-delivery note at R500+", "Free doorstep delivery unlocked" in note, note)

# 10. add-to-cart area always visible (touch-friendly)
btn_visible = driver.execute_script("""
  var b = document.querySelector('.product-grid .btn-cart');
  return b.getBoundingClientRect().height > 0;
""")
check("add-to-cart button always visible", btn_visible)

# 10b. hero carousel initialised (autoplay + pagination)
hero = driver.execute_script("""
  var s = document.querySelector('.hero-carousel');
  return s.swiper ? {slides: s.querySelectorAll('.swiper-slide').length,
                     autoplay: !!(s.swiper.autoplay && s.swiper.autoplay.running),
                     bullets: document.querySelectorAll('.hero-carousel .swiper-pagination-bullet').length}
                  : null;
""")
check("hero carousel live (4 slides, autoplay, 4 bullets)",
      hero and hero["slides"] == 4 and hero["autoplay"] and hero["bullets"] == 4, hero)

# 10c. brand imagery — header emblem + Whole Spices & Seeds category thumb
logo = driver.execute_script("""
  var i = document.querySelector('.nav-logo');
  if (!i) return null;
  var b = i.getBoundingClientRect(), s = document.querySelector('.search-bar').getBoundingClientRect();
  return {loaded: i.complete && i.naturalWidth > 0, w: Math.round(b.width), h: Math.round(b.height),
          gap: Math.round(Math.abs((b.y + b.height/2) - (s.y + s.height/2)))};
""")
check("nav emblem loaded, 48px, level with the search bar",
      logo and logo["loaded"] and logo["w"] == 48 and logo["h"] == 48 and logo["gap"] <= 1, logo)

thumbs = driver.execute_script("""
  return [['Whole Spices & Seeds', 'images/category/images.png'],
          ['Adaptogens', 'images/category/adoptegens.png'],
          ['Superfoods', 'images/category/superfoods.png'],
          ['Herbal Teas', 'images/category/herbal.png'],
          ['Curry Essentials', 'images/category/curry.png'],
          ['AP ORGANICS', 'images/category/organ.png'],
          ['Dried Herbs', 'images/category/herbs.png'],
          ['Incense & Wellness', 'images/category/incense.png']].map(function(t){
    var i = document.querySelector('img[alt="' + t[0] + '"]');
    var r = i ? i.getBoundingClientRect() : {width: 0};
    return {alt: t[0], src: i ? i.getAttribute('src') : null, nw: i ? i.naturalWidth : 0,
            decoded: !!i && i.complete && i.naturalWidth >= 400,  // floor, not exact: photos get re-supplied
            w: Math.round(r.width)};
  });
""")
bad = [t for t in thumbs
       if not (t["decoded"] and t["w"] == 140 and t["src"] and t["src"].startswith("images/category/"))]
check("supplied CATEGORY thumbs point at images/category/ and decode (%d tiles)" % len(thumbs),
      not bad, bad or "all decoded at >=400px, 140px circles")

# 11. console errors (exclude the known Google Fonts network warning)
browser_errors = [l["message"] for l in driver.get_log("browser")
                  if l["level"] in ("SEVERE", "ERROR") and "fonts.googleapis" not in l["message"]]
check("no browser console errors", len(browser_errors) == 0, browser_errors[:2])

driver.save_screenshot("/tmp/store-test.png")
driver.quit()

print("\n" + ("ALL TESTS PASSED" if not errors else f"{len(errors)} FAILURES: {errors}"))
raise SystemExit(1 if errors else 0)
