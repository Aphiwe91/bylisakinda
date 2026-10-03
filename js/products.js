/* AP Global Organics — product data.
   Generated from atlas_80g_costing.xlsx (source of truth for pack sizes and prices).
   Price formula: pack_price / pack_g x size x 1.7  (70% markup on cost), 2 dp. */
const PRODUCTS = [
  {
    "name": "Ashwagandha Powder (Indian Ginseng)",
    "photo": "images/product-photo-1.jpg",
    "pack_g": 500,
    "pack_price": 102.3,
    "cat": "Adaptogens & Wellness",
    "use": "Stress-balancing adaptogen — stir into morning coffee, smoothies or golden milk.",
    "p80": 27.83,
    "p200": 69.56,
    "p500": 173.91
  },
  {
    "name": "Atlas Butter Chicken Spice",
    "photo": "images/product-photo-13.jpg",
    "pack_g": 500,
    "pack_price": 69.6,
    "cat": "Spices & Blends",
    "use": "Creamy butter-chicken base — tomato, cream and spice in one jar.",
    "p80": 18.93,
    "p200": 47.33,
    "p500": 118.32
  },
  {
    "name": "Atlas Raj Curry Powder",
    "photo": "images/product-photo-14.jpg",
    "pack_g": 500,
    "pack_price": 63,
    "cat": "Spices & Blends",
    "use": "Mild, golden Raj curry base for everyday family meals.",
    "p80": 17.14,
    "p200": 42.84,
    "p500": 107.1
  },
  {
    "name": "Barbeque Spice",
    "photo": "images/product-photo-16.jpg",
    "pack_g": 500,
    "pack_price": 33.5,
    "cat": "Spices & Blends",
    "use": "The braai rub — slap it on chicken, ribs, wors and corn.",
    "p80": 9.11,
    "p200": 22.78,
    "p500": 56.95
  },
  {
    "name": "Basil",
    "photo": "images/product-photo-27.jpg",
    "pack_g": 100,
    "pack_price": 11.3,
    "cat": "Herbs",
    "use": "The pesto herb — tomatoes, salads, pizzas and caprese.",
    "p80": 15.37,
    "p200": 38.42,
    "p500": 96.05
  },
  {
    "name": "Bay Leaves",
    "photo": "images/product-photo-25.jpg",
    "pack_g": 100,
    "pack_price": 20.4,
    "cat": "Herbs",
    "use": "Slow-cooked depth for potjies, stews, curries and rice.",
    "p80": 27.74,
    "p200": 69.36,
    "p500": 173.4
  },
  {
    "name": "Biltong Spice",
    "photo": "images/product-photo-15.jpg",
    "pack_g": 500,
    "pack_price": 46.5,
    "cat": "Spices & Blends",
    "use": "The classic biltong cure — also great on roasted potatoes.",
    "p80": 12.65,
    "p200": 31.62,
    "p500": 79.05
  },
  {
    "name": "Birds Eye Chili Powder",
    "photo": "images/product-photo-21.jpg",
    "pack_g": 500,
    "pack_price": 95.4,
    "cat": "Spices & Blends",
    "use": "Serious heat for peri-peri sauces, piri-piri chicken and spicy braais.",
    "p80": 25.95,
    "p200": 64.87,
    "p500": 162.18
  },
  {
    "name": "Cassava Flour",
    "photo": "images/product-photo-30.jpg",
    "pack_g": 500,
    "pack_price": 21,
    "cat": "Baking & Pantry",
    "use": "Grain-free 1:1 wheat swap for scones, pancakes and flatbreads.",
    "p80": 5.71,
    "p200": 14.28,
    "p500": 35.7
  },
  {
    "name": "Cayenne Pepper Powder",
    "photo": "images/product-photo-19.jpg",
    "pack_g": 500,
    "pack_price": 40.6,
    "cat": "Spices & Blends",
    "use": "Clean, direct heat for hot sauces, wings and spice rubs.",
    "p80": 11.04,
    "p200": 27.61,
    "p500": 69.02
  },
  {
    "name": "Chickpeas / Whole Chana",
    "photo": "images/product-photo-29.jpg",
    "pack_g": 500,
    "pack_price": 25,
    "cat": "Bulk & Staples",
    "use": "Soak and boil for curries, chana masala, salads and hummus.",
    "p80": 6.8,
    "p200": 17.0,
    "p500": 42.5
  },
  {
    "name": "Coarse Himalayan Pink Salt",
    "photo": "images/product-photo-31.jpg",
    "pack_g": 1000,
    "pack_price": 23,
    "cat": "Bulk & Staples",
    "use": "Finishing salt for steaks, salads, caramels and rimming glasses.",
    "p80": 3.13,
    "p200": 7.82,
    "p500": 19.55
  },
  {
    "name": "Crushed Chilli",
    "photo": "images/product-photo-20.jpg",
    "pack_g": 500,
    "pack_price": 58.9,
    "cat": "Spices & Blends",
    "use": "Rustic chilli flakes for pizzas, pastas and spicy oils.",
    "p80": 16.02,
    "p200": 40.05,
    "p500": 100.13
  },
  {
    "name": "Curry Powder",
    "photo": "images/product-photo-18.jpg",
    "pack_g": 500,
    "pack_price": 34.7,
    "cat": "Spices & Blends",
    "use": "Everyday curry base for chicken, beans, lentils and rice.",
    "p80": 9.44,
    "p200": 23.6,
    "p500": 58.99
  },
  {
    "name": "Dried Parsley",
    "photo": "images/product-photo-26.jpg",
    "pack_g": 100,
    "pack_price": 10.7,
    "cat": "Herbs",
    "use": "Fresh-finish herb for salads, eggs, fish and potato bakes.",
    "p80": 14.55,
    "p200": 36.38,
    "p500": 90.95
  },
  {
    "name": "Fine Black Pepper",
    "photo": "images/product-photo-6.jpg",
    "pack_g": 500,
    "pack_price": 135.8,
    "cat": "Spices & Blends",
    "use": "Fresh-ground pepper for everything — also unlocks turmeric's curcumin.",
    "p80": 36.94,
    "p200": 92.34,
    "p500": 230.86
  },
  {
    "name": "Fine Cinnamon",
    "photo": "images/product-photo-9.jpg",
    "pack_g": 500,
    "pack_price": 73.8,
    "cat": "Spices & Blends",
    "use": "Sweet and savoury — porridge, chai, curries and baked apples.",
    "p80": 20.07,
    "p200": 50.18,
    "p500": 125.46
  },
  {
    "name": "Fine Ginger",
    "photo": "images/product-photo-4.jpg",
    "pack_g": 500,
    "pack_price": 85.2,
    "cat": "Spices & Blends",
    "use": "Fresh-tasting warmth for teas, curries, baking and golden milk.",
    "p80": 23.17,
    "p200": 57.94,
    "p500": 144.84
  },
  {
    "name": "Fine Jeera (Cumin)",
    "photo": "images/product-photo-10.jpg",
    "pack_g": 500,
    "pack_price": 71.4,
    "cat": "Spices & Blends",
    "use": "Toasted cumin for curries, rice, dals and house spice blends.",
    "p80": 19.42,
    "p200": 48.55,
    "p500": 121.38
  },
  {
    "name": "Garam Masala",
    "photo": "images/product-photo-7.jpg",
    "pack_g": 500,
    "pack_price": 79.9,
    "cat": "Spices & Blends",
    "use": "Warm finishing spice for curries, dals and spiced chai.",
    "p80": 21.73,
    "p200": 54.33,
    "p500": 135.83
  },
  {
    "name": "Garlic Powder",
    "photo": "images/product-photo-12.jpg",
    "pack_g": 500,
    "pack_price": 50.5,
    "cat": "Spices & Blends",
    "use": "Instant savoury base for marinades, rubs, soups and chip seasoning.",
    "p80": 13.74,
    "p200": 34.34,
    "p500": 85.85
  },
  {
    "name": "Ground Cloves",
    "photo": "images/product-photo-5.jpg",
    "pack_g": 500,
    "pack_price": 135.5,
    "cat": "Spices & Blends",
    "use": "Intense warm spice for curries, chai, ham and baked fruit.",
    "p80": 36.86,
    "p200": 92.14,
    "p500": 230.35
  },
  {
    "name": "Italian Herbs",
    "photo": "images/product-photo-22.jpg",
    "pack_g": 100,
    "pack_price": 22,
    "cat": "Herbs",
    "use": "The Italian kitchen mix — pizza, pasta, garlic bread and salads.",
    "p80": 29.92,
    "p200": 74.8,
    "p500": 187.0
  },
  {
    "name": "Kowdi Lubaan (Frank Incense)",
    "photo": "images/product-photo-28.jpg",
    "pack_g": 500,
    "pack_price": 73,
    "cat": "Adaptogens & Wellness",
    "use": "Frankincense resin — traditional wellness tea, or burn as ceremonial incense.",
    "p80": 19.86,
    "p200": 49.64,
    "p500": 124.1
  },
  {
    "name": "Moringa Powder",
    "photo": "images/product-photo-2.jpg",
    "pack_g": 500,
    "pack_price": 79,
    "cat": "Adaptogens & Wellness",
    "use": "Nutrient-dense superleaf — blend into smoothies, juices or sprinkle over porridge.",
    "p80": 21.49,
    "p200": 53.72,
    "p500": 134.3
  },
  {
    "name": "Mother In Law Masala",
    "photo": "images/product-photo-8.jpg",
    "pack_g": 500,
    "pack_price": 80.4,
    "cat": "Spices & Blends",
    "use": "Signature house blend for hearty curries and potjies.",
    "p80": 21.87,
    "p200": 54.67,
    "p500": 136.68
  },
  {
    "name": "Oregano",
    "photo": "images/product-photo-24.jpg",
    "pack_g": 100,
    "pack_price": 11.3,
    "cat": "Herbs",
    "use": "Pizza and pasta staple — tomatoes, grilled meats and Mediterranean dishes.",
    "p80": 15.37,
    "p200": 38.42,
    "p500": 96.05
  },
  {
    "name": "Peri-Peri Spice",
    "photo": "images/product-photo-17.jpg",
    "pack_g": 500,
    "pack_price": 37.2,
    "cat": "Spices & Blends",
    "use": "The classic peri-peri marinade — baste chicken, prawns or chips.",
    "p80": 10.12,
    "p200": 25.3,
    "p500": 63.24
  },
  {
    "name": "Smoked Paprika",
    "photo": "images/product-photo-11.jpg",
    "pack_g": 500,
    "pack_price": 68.4,
    "cat": "Spices & Blends",
    "use": "Smoky depth for rubs, chorizo, deviled eggs and braai spice.",
    "p80": 18.6,
    "p200": 46.51,
    "p500": 116.28
  },
  {
    "name": "Thyme",
    "photo": "images/product-photo-23.jpg",
    "pack_g": 100,
    "pack_price": 13.1,
    "cat": "Herbs",
    "use": "Woody herb for roasts, stews, soups and braai corn.",
    "p80": 17.82,
    "p200": 44.54,
    "p500": 111.35
  },
  {
    "name": "Turmeric Powder",
    "photo": "images/product-photo-3.jpg",
    "pack_g": 500,
    "pack_price": 42.7,
    "cat": "Spices & Blends",
    "use": "Golden teas, curries, rice and smoothies — the base of every golden milk.",
    "p80": 11.61,
    "p200": 29.04,
    "p500": 72.59
  }
];

const PRODUCT_CATEGORIES = ["Adaptogens & Wellness", "Spices & Blends", "Herbs", "Baking & Pantry", "Bulk & Staples"];

/* Real bundles from the Commercial Growth & Pricing Strategy doc (Sep 2026). */
const BUNDLES = [
  {
    "name": "Daily Wellness Ritual Kit",
    "price": 129.0,
    "blurb": "Ashwagandha 80g + Moringa 80g with a custom shaker pouch — one month of calm, R129.",
    "products": [
      "Ashwagandha Powder (Indian Ginseng)",
      "Moringa Powder"
    ]
  },
  {
    "name": "Braai Master Trio",
    "price": 199.0,
    "blurb": "Barbeque Spice, Biltong Spice, Smoked Paprika and Peri-Peri in four 80g pouches, with a wooden braai spoon — R199.",
    "products": [
      "Barbeque Spice",
      "Biltong Spice",
      "Smoked Paprika",
      "Peri-Peri Spice"
    ]
  },
  {
    "name": "Cape Spice Route Box",
    "price": 399.0,
    "blurb": "Mother In Law Masala, Garam Masala, Atlas Raj Curry and Turmeric, 200g each, in a heritage recipe box — R399.",
    "products": [
      "Mother In Law Masala",
      "Garam Masala",
      "Atlas Raj Curry Powder",
      "Turmeric Powder"
    ]
  }
];
