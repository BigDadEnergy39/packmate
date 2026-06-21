// ─── Activity Templates ───────────────────────────────────────────────────────

export const ACTIVITY_TEMPLATES = {
  camping: {
    label: "Camping", icon: "⛺", color: "#2D5016",
    groupItems: ["DSLR Camera", "First aid kit", "Firewood / fire starter", "Lantern", "Tarp / rain shelter", "Trash bags", "Maps / trail guide", "Multi-tool"],
    items: {
      adult: ["Tent", "Sleeping bag", "Sleeping pad", "Headlamp", "Sunglasses", "Camp chair", "Hiking boots", "Warm jacket", "Rain gear", "Sunscreen", "Bug spray", "Pocket knife", "Toiletries bag"],
      child: ["Sleeping bag (kid-size)", "Flashlight", "Sunglasses", "Warm layers", "Sneakers", "Sun hat", "Comfort toy", "Coloring book & crayons", "Bug spray (kid-safe)"],
      baby:  ["Pack-n-play", "Baby sleeping bag", "Diapers & wipes", "Baby carrier", "Warm onesies", "Baby sunscreen", "Blanket", "Pacifier"],
      pet:   ["Leash & collar", "Pet bed", "Waste bags", "Pet first aid", "Tie-out cable"],
    },
  },
  roadtrip: {
    label: "Road Trip", icon: "🚗", color: "#7B2D8B",
    groupItems: ["DSLR Camera", "Paper towels / napkins", "Trash bag for the car", "First aid kit", "Roadside emergency kit", "Shared playlist / audiobooks", "Physical map / atlas (backup)", "Car phone charger (multi-port)"],
    items: {
      adult: ["Phone charger & car mount", "Comfortable clothes", "Sunglasses", "Travel pillow", "Cash & cards", "ID/passport", "Toiletries", "Change of clothes", "Reusable bags"],
      child: ["Car entertainment (tablet, books)", "Headphones", "Sunglasses", "Comfort blanket", "Travel games", "Crayons & coloring book", "Change of clothes", "Car seat"],
      baby:  ["Car seat", "Diapers & wipes (lots!)", "Pacifier", "Change of clothes x3", "Blanket", "Toys", "Diaper bag", "Trash bags"],
      pet:   ["Pet seat belt/carrier", "Leash & collar", "Waste bags", "Favorite toy", "Pet blanket", "Vet records"],
    },
  },
  business: {
    label: "Business Trip", icon: "💼", color: "#1A1A2E",
    groupItems: ["DSLR Camera", "Shared presentation materials", "Team business cards", "Portable projector / adapter", "Extension cord / power strip"],
    items: {
      adult: ["Business attire", "Dress shoes", "Sunglasses", "Laptop & charger", "Business cards", "Portfolio/notebook", "Toiletries", "Casual outfit", "Gym clothes", "Garment bag", "Travel adapter", "ID/passport", "Boarding pass"],
      child: [], baby: [], pet: [],
    },
  },
  cabin: {
    label: "Cabin Trip", icon: "🏡", color: "#8B5E3C",
    groupItems: ["DSLR Camera", "Trash bags", "First aid kit", "Firewood or fire starter", "Board games / cards"],
    items: {
      adult: ["Warm layers", "Hiking boots", "Sunglasses", "Flashlight / headlamp", "Book / e-reader", "Blanket", "Toiletries bag"],
      child: ["Warm layers", "Hiking shoes", "Sunglasses", "Games & activities", "Coloring / art supplies", "Flashlight", "Comfort toy or blanket"],
      baby:  ["High chair (portable)", "Diapers & wipes", "Pack-n-play", "Warm onesies & layers", "Baby blanket", "Pacifier"],
      pet:   ["Leash & collar", "Pet bed or blanket", "Waste bags", "Towel for muddy paws", "Favorite toy", "Pet first aid"],
    },
  },
  sleepover: {
    label: "Sleepover", icon: "🛏️", color: "#6C5CE7",
    groupItems: ["DSLR Camera", "Movie picks", "Board games / card games", "Bluetooth speaker"],
    items: {
      adult: ["Sleeping bag or blanket & pillow", "Sunglasses", "Phone & charger", "Change of clothes for tomorrow", "Hairbrush / hair ties", "Face mask / skincare", "Nail polish"],
      child: ["Sleeping bag", "Pillow", "Sunglasses", "Change of clothes", "Flashlight", "Hairbrush / hair ties", "Journal or sketchbook", "Nail polish / friendship bracelets", "Slippers"],
      baby: [], pet: [],
    },
  },
  other: {
    label: "Other", icon: "📋", color: "#5A6B4F",
    groupItems: ["DSLR Camera", "First aid kit", "Trash bags"],
    items: {
      adult: ["Cash & cards", "ID/passport", "Comfortable shoes", "Sunglasses", "Light jacket"],
      child: ["Comfortable shoes", "Sunglasses", "Light jacket", "Entertainment"],
      baby:  ["Diapers & wipes", "Pacifier", "Change of clothes", "Blanket"],
      pet:   ["Leash & collar", "Waste bags"],
    },
  },
};

// ─── Weather ──────────────────────────────────────────────────────────────────

export const WEATHER_ADDITIONS = {
  hot:   { label: "Hot Weather", icon: "☀️",  items: ["Extra sunscreen", "Cooling towel", "Light breathable clothing", "Electrolyte packets", "Wide-brim hat"] },
  cold:  { label: "Cold Weather", icon: "❄️",  items: ["Extra warm layers", "Thermal underwear", "Heavy socks", "Hand & toe warmers", "Lip balm"] },
  rainy: { label: "Rainy",        icon: "🌧️", items: ["Rain jacket", "Waterproof bag covers", "Umbrella", "Quick-dry towel", "Extra socks", "Waterproof shoes"] },
  humid: { label: "Humid",        icon: "🌫️", items: ["Anti-chafe balm", "Moisture-wicking clothing", "Dry bags for electronics", "Extra changes of clothes"] },
};

// ─── Food ─────────────────────────────────────────────────────────────────────

export const FOOD_ITEMS = {
  camping:   ["Cooler with ice", "Camp stove & fuel", "Cooking utensils", "Plates & bowls", "Cups & mugs", "Reusable water bottles", "Snacks & trail mix", "Marshmallows & s'mores supplies", "Coffee / tea", "Condiments (salt, pepper, ketchup)", "Aluminum foil", "Trash bags for food waste", "Can opener", "Cutting board & knife", "Paper towels / napkins", "Pet food & bowls", "Baby formula / baby food", "Baby bottles"],
  roadtrip:  ["Cooler bag", "Road snacks & drinks", "Reusable water bottles", "Sippy cups / kid drinks", "Napkins / paper towels", "Gum / mints", "Travel mugs", "Trash bag for wrappers", "Pet food & water bowls", "Baby formula / baby food", "Baby bottles"],
  business:  ["Reusable water bottle", "Snack bars", "Mints / gum", "Travel coffee mug"],
  cabin:     ["Groceries & meal plan", "Cooler / insulated bags", "Cooking oil & butter", "Salt, pepper & spices", "Coffee / tea", "Snacks", "Reusable water bottles", "Corkscrew / bottle opener", "Ziplock bags & containers", "Aluminum foil & plastic wrap", "Can opener", "Cutting board & knife", "Pots & pans", "Baking sheet", "Spatula & cooking spoon", "Dish soap & sponge", "Paper towels", "Baby food & snacks", "Baby bottles / sippy cups", "Baby-safe utensils & bowls", "Pet food & bowls"],
  sleepover: ["Pizza / group snacks", "Popcorn & candy", "Drinks & juice boxes", "Breakfast supplies", "Snacks to share"],
  other:     ["Snacks & drinks", "Reusable water bottle", "Napkins", "Pet food & bowls", "Baby formula / baby food", "Baby bottles"],
  _default:  ["Snacks & drinks", "Reusable water bottles", "Napkins / paper towels"],
};

// ─── Add-ons ──────────────────────────────────────────────────────────────────

export const ACTIVITY_ADDONS = {
  swimming: {
    label: "Swimming", icon: "🏊",
    items: {
      adult:  ["Swimsuit", "Swim towel", "Goggles", "Flip flops / sandals", "Sunscreen (waterproof)", "Change of clothes", "Wet bag for swimwear", "Hair tie / swim cap"],
      child:  ["Swimsuit", "Swim towel", "Goggles", "Water shoes", "Sunscreen (waterproof, kid-safe)", "Rash guard", "Change of clothes", "Floaties / life vest", "Wet bag for swimwear"],
      baby:   ["Swim diaper(s)", "Baby swimsuit", "Baby sunscreen (waterproof)", "Swim towel", "Change of clothes", "Baby float / swim seat"],
      pet:    ["Pet life vest", "Towel for pet", "Portable water bowl"],
      group:  ["Pool / lake toys", "Extra sunscreen station", "Shared cooler for poolside drinks"],
    },
  },
  hiking: {
    label: "Hiking", icon: "🥾",
    items: {
      adult:  ["Trekking poles", "Trail map / compass", "Extra water bottles", "Blister pads", "Gaiters", "Headlamp", "Emergency whistle", "Bear spray (if applicable)"],
      child:  ["Kid-sized trekking poles", "Snack pack", "Small backpack", "Blister pads"],
      baby:   ["Baby hiking carrier", "Baby hat & sun protection", "Extra layers"],
      pet:    ["Dog booties", "Pet backpack", "Collapsible water bowl", "Dog-safe tick repellent"],
      group:  ["Shared first aid kit", "Group trail map", "Emergency blanket"],
    },
  },
  cycling: {
    label: "Cycling", icon: "🚴",
    items: {
      adult:  ["Helmet", "Cycling gloves", "Padded shorts", "Bike lock", "Repair kit & pump", "Water bottle cage", "Cycling jersey", "Sunglasses"],
      child:  ["Helmet (kid-size)", "Knee & elbow pads", "Bike gloves"],
      baby:   ["Bike trailer or seat", "Baby helmet"],
      pet:    ["Pet bike carrier or trailer"],
      group:  ["Shared repair kit", "Group first aid kit"],
    },
  },
  fishing: {
    label: "Fishing", icon: "🎣",
    items: {
      adult:  ["Fishing rod & reel", "Tackle box & lures", "Fishing license", "Waders", "Landing net", "Bait", "Cooler for catch", "Sun hat", "Polarized sunglasses"],
      child:  ["Kid fishing rod", "Life vest", "Sun hat", "Snacks for the wait"],
      baby:   [],
      pet:    ["Pet life vest", "Long leash"],
      group:  ["Shared cooler", "Fish cleaning supplies", "Extra tackle"],
    },
  },
  skiing: {
    label: "Skiing / Snowboarding", icon: "⛷️",
    items: {
      adult:  ["Ski/snowboard equipment", "Ski boots", "Goggles", "Helmet", "Ski jacket & pants", "Base layers (thermal)", "Gloves or mittens", "Neck gaiter / balaclava", "Hand warmers", "Lift ticket / pass", "Sunscreen (SPF 50+)"],
      child:  ["Ski/snowboard equipment (kid-size)", "Helmet", "Goggles", "Waterproof jacket & pants", "Warm layers", "Hand warmers"],
      baby:   ["Snowsuit", "Warm hat & mittens", "Baby carrier (winter)"],
      pet:    ["Dog booties", "Dog jacket"],
      group:  ["Shared sunscreen station", "Group locker key"],
    },
  },
  photography: {
    label: "Photography", icon: "📷",
    items: {
      adult:  ["Camera body & lenses", "Extra batteries & charger", "Memory cards", "Camera bag / backpack", "Tripod", "Lens cleaning kit", "Rain cover for gear", "Remote shutter"],
      child:  ["Kid camera or GoPro", "Wrist strap"],
      baby:   [],
      pet:    [],
      group:  ["Shared tripod", "Group photo backdrop (optional)"],
    },
  },
  beach: {
    label: "Beach Day", icon: "🏖️",
    items: {
      adult:  ["Beach towel", "Beach umbrella", "Sand-free mat", "Waterproof phone case", "Extra sunscreen", "After-sun lotion", "Rash guard", "Flip flops", "Beach bag", "Portable speaker"],
      child:  ["Beach toys (buckets, shovels)", "Rash guard", "Sand-free towel", "Water shoes", "Floaties"],
      baby:   ["Beach tent / shade shelter", "Baby swimsuit", "Baby sunscreen (mineral)", "Swim diaper(s)", "Sand-free blanket"],
      pet:    ["Pet life vest", "Shade tent for pet", "Portable water bowl", "Towel for pet"],
      group:  ["Beach games (volleyball, frisbee)", "Shared cooler", "Beach umbrella anchors"],
    },
  },
  camping_cooking: {
    label: "Camp Cooking", icon: "🍳",
    items: {
      adult:  ["Cast iron skillet", "Camp Dutch oven", "Cooking grate", "Long-handled tongs", "Heat-resistant gloves", "Spice kit", "Cooking oil", "Cutting board & knife"],
      child:  ["Kid-safe tasks list", "Apron"],
      baby:   [],
      pet:    [],
      group:  ["Shared propane", "Group meal plan", "Dish tub & biodegradable soap", "Hang bag for food storage"],
    },
  },
  yoga_wellness: {
    label: "Yoga / Wellness", icon: "🧘",
    items: {
      adult:  ["Yoga mat", "Resistance bands", "Foam roller", "Meditation cushion", "Essential oils", "Journal & pen", "Reusable water bottle", "Comfortable workout clothes"],
      child:  ["Kids yoga mat", "Comfortable clothes"],
      baby:   [],
      pet:    [],
      group:  ["Shared speaker for meditation music", "Group mats"],
    },
  },
  water_sports: {
    label: "Water Sports", icon: "🏄",
    items: {
      adult:  ["Life vest / PFD", "Wetsuit or rash guard", "Water shoes", "Dry bag", "Waterproof sunscreen", "Waterproof watch", "Paddle / oar"],
      child:  ["Child life vest (USCG approved)", "Wetsuit (kid-size)", "Water shoes"],
      baby:   ["Baby life vest", "Baby wetsuit"],
      pet:    ["Pet life vest", "Towel for pet"],
      group:  ["Shared dry bags", "Throw rope / rescue line"],
    },
  },
};

// ─── Duration ─────────────────────────────────────────────────────────────────

export const DURATION_ITEMS = [
  {
    minNights: 1, label: "Overnight essentials",
    items: {
      adult: ["Pajamas", "Phone charger", "Medications (if needed)", "Toothbrush", "Toothpaste", "Vitamins"],
      child: ["Pajamas", "Stuffed animal / comfort item", "Toothbrush", "Toothpaste", "Vitamins"],
      baby:  ["Night diapers", "Sleep sack / blanket", "White noise machine"],
      pet:   [],
      group: ["Shampoo", "Conditioner", "Soap / body wash"],
    },
  },
  {
    minNights: 2, label: "Multi-day basics",
    items: {
      adult: ["Deodorant", "Underwear ×{nights}", "Socks ×{nights}", "Outfits ×{nights}"],
      child: ["Underwear ×{nights}", "Socks ×{nights}", "Outfits ×{nights}"],
      baby:  ["Diapers ×{nightsX8}", "Baby wipes (large pack)", "Extra onesies ×{nightsX2}", "Baby laundry bags"],
      pet:   ["Extra waste bags"],
      group: [],
    },
  },
  {
    minNights: 4, label: "Extended stay",
    items: {
      adult: ["Laundry bag", "Stain remover pen", "Extra shoes", "Razor / shaving kit", "Hairbrush / comb", "Skincare essentials"],
      child: ["Laundry bag", "Extra shoes", "Hairbrush", "Activity books / toys"],
      baby:  ["Baby laundry detergent", "Extra pacifiers", "Portable high chair"],
      pet:   ["Extra pet treats", "Familiar blanket from home"],
    },
  },
  {
    minNights: 7, label: "Week+ trip",
    items: {
      adult: ["Travel-size laundry detergent", "Sewing kit", "Extra charger cable", "Portable power bank", "Light jacket or layers for varied weather", "Dressy outfit (just in case)"],
      child: ["Travel-size laundry soap", "Extra entertainment", "Comfort item from home"],
      baby:  ["Bulk diapers", "Portable bathtub"],
      pet:   ["Vet records / vaccination proof", "Familiar toy from home"],
    },
  },
];

// ─── Person Types ─────────────────────────────────────────────────────────────

export const PERSON_TYPES = [
  { value: "adult", label: "Adult", icon: "🧭" },
  { value: "child", label: "Child", icon: "⭐" },
  { value: "baby",  label: "Baby",  icon: "🍼" },
  { value: "pet",   label: "Pet",   icon: "🐾" },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  trips:             'packmate-trips',
  customAddons:      'packmate-custom-addons',
  templateOverrides: 'packmate-template-overrides',
  customActivities:  'packmate-custom-activities',
  hiddenActivities:  'packmate-hidden-activities',
  customIcons:       'packmate-custom-icons',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// IDs are only used as local, in-app keys (no cryptographic requirement), so a
// Math.random-based UUIDv4 fallback is fine when the JS engine has no global
// `crypto` (Hermes does not always expose one — and there is no polyfill here).
export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) { /* fall through to Math.random implementation */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const BABY_KEYWORDS = /baby|formula|sippy|onesie|infant|toddler/i;
const PET_KEYWORDS  = /\bpet\b|dog food|cat food/i;

export const filterFoodItems = (items, hasBaby, hasPet) =>
  items.filter(item => {
    if (BABY_KEYWORDS.test(item) && !hasBaby) return false;
    if (PET_KEYWORDS.test(item)  && !hasPet)  return false;
    return true;
  });

export const applyDurationPlaceholders = (text, nights) =>
  text
    .replace(/\{nights\}/g,   String(nights))
    .replace(/\{nightsX2\}/g, String(nights * 2))
    .replace(/\{nightsX8\}/g, String(nights * 8));

// ─── Template Overrides ───────────────────────────────────────────────────────
// Merge user customizations (from the Template Editor) onto a base template.
// Override shapes (per src/screens/TemplateEditorScreen.js saveTab):
//   activity  → { groupItems?: string[], items?: { adult?: [], child?: [], ... } }
//   duration  → { items?: { adult?: [], group?: [], ... } }
// Only edited person-type tabs appear in `items`; untouched tabs fall back to base.

export const getEffectiveActivityTemplate = (base, override) => {
  if (!base || !override) return base;
  return {
    ...base,
    groupItems: override.groupItems ?? base.groupItems,
    items: { ...base.items, ...(override.items || {}) },
  };
};

export const getEffectiveDurationItems = (overrides = {}) =>
  DURATION_ITEMS.map((d) => {
    const ov = overrides[`duration_${d.minNights}`];
    if (!ov) return d;
    return { ...d, items: { ...d.items, ...(ov.items || {}) } };
  });
