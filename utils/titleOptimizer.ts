
// UNIVERSAL GAMING DICTIONARIES

// 1. RARE ITEMS (Priority 1 for Hero Slot)
const HIGH_VALUE_ITEMS = [
  // VALORANT
  "Kuronami", "Reaver", "Elderflame", "Prelude", "Araxys", "Glitchpop", "Prime", "Oni", "Singularity", 
  "Spectrum", "Champions", "Arcane", "Sheriff", "Vandal", "Phantom", "Operator", "Butterfly", "Karambit", 
  "Rgx", "Xenohunter", "Imperium", "Neo Frontier", "Gaia", "Mystbloom",
  // CS2 (CSGO)
  "Dragon Lore", "Gungnir", "Prince", "Howl", "Fire Serpent", "Medusa", "Lotus", "Sapphire", "Ruby", "Emerald", 
  "Doppler", "Fade", "Tiger Tooth", "Marble Fade", "Case Hardened", "Gloves", "Knives", "Bayonet", "Talon", 
  "Skeleton", "Nomad", "Ursus", "Navaja", "Stiletto", "Paracord", "Survival", "Classic Knife",
  // FORTNITE
  "Travis Scott", "Black Knight", "Ikonik", "Galaxy", "Glow", "Wonder", "Wildcat", "Renegade Raider", 
  "Aerial Assault", "Ghoul Trooper", "Skull Trooper", "The Reaper", "John Wick", "Minty", "Leviathan", 
  "Raiders Revenge", "Sparkle Specialist", "Royale Bomber", "Double Helix", "Honor Guard", "Stealth Reflex",
  // GENSHIN IMPACT
  "C6", "R5", "Arlecchino", "Furina", "Neuvillette", "Raiden", "Zhongli", "Nahida", "Yelan", "Hu Tao", 
  "Kazuha", "Xiao", "Ayaka", "Ganyu", "Archon",
  // LEAGUE OF LEGENDS
  "Pax", "Soulstealer", "Prestige", "Hextech", "God King", "Elementalist", "Spirit Blossom", "Ufo Corki", 
  "King Rammus", "Rusty Blitzcrank", "Championship Riven",
  // STEAM / GENERAL
  "Steam Level", "Year Badge", "Years of Service"
];

// 2. RANKS (Priority 2 for Hero Slot)
const RANKS = [
  // Valorant / LoL / TFT
  "Radiant", "Immortal", "Ascendant", "Diamond", "Platinum", "Plat", "Gold", "Silver", "Bronze", "Iron",
  "Challenger", "Grandmaster", "Master", "Emerald", 
  // CS2
  "Global Elite", "Supreme", "LEM", "Eagle", "DMG", "Faceit 10", "Faceit Lvl 10",
  // Fortnite
  "Unreal", "Elite", "Champion"
];

// 3. WORDS TO REMOVE (Strictly Redundant Access Terms only)
const REMOVAL_KEYWORDS = [
  "full access", "fa", "full ownership", "access", "email change", "mail change",
  "changeable", "original mail", "oge"
];

// Helper to title case properly, keeping specific acronyms uppercase
const toTitleCase = (str: string) => {
  const upperAcronyms = ["CS2", "CSGO", "LOL", "NA", "EU", "OCE", "ASIA", "KR", "TR", "RU", "BR", "LATAM", "OG", "PBE", "AR", "MR", "PC", "PSN", "XBOX"];
  
  return str.replace(/\w\S*/g, (txt) => {
    const upper = txt.toUpperCase();
    if (upperAcronyms.includes(upper)) return upper;
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Helper to escape regex characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const optimizeTitle = (rawTitle: string): string => {
  // Working copy for analysis
  const lowerTitle = rawTitle.toLowerCase();

  // --- STEP A: INTELLIGENT EXTRACTION ---
  
  // 1. Detect Count (e.g., "150 Skins", "Level 300")
  // Matches number + space + keyword
  const countRegex = /\b(\d+)\+?\s*(skins?|champs?|champions?|agents?|knives|gloves|games?|wins?|lvl|level|ar)\b/i;
  const countMatch = lowerTitle.match(countRegex);
  const extractedCount = countMatch ? toTitleCase(countMatch[0]) : null;

  // 2. Detect Rank
  let detectedRank: string | null = null;
  for (const rank of RANKS) {
    const regex = new RegExp(`\\b${escapeRegExp(rank.toLowerCase())}\\b`, "i");
    if (regex.test(lowerTitle)) {
      detectedRank = rank; 
      break; // Take the first recognized rank
    }
  }

  // 3. Detect Hero Item (Rare Skin)
  let heroItem: string | null = null;
  for (const item of HIGH_VALUE_ITEMS) {
    if (lowerTitle.includes(item.toLowerCase())) {
      heroItem = item;
      break; // Take the first recognized rare item
    }
  }

  // --- STEP B: CONSTRUCT ANCHOR (The "Hero" Part) ---
  // Logic: Rare Item > High Rank > Count > Default
  
  let heroPart = "";
  let detailPart = "";
  
  // Track what we use so we can remove it from the description later
  const usedTerms: string[] = [];

  if (heroItem) {
    heroPart = heroItem;
    usedTerms.push(heroItem);
    
    if (detectedRank) {
        detailPart = detectedRank + " Rank";
        usedTerms.push(detectedRank);
    } else if (extractedCount) {
        detailPart = extractedCount;
        usedTerms.push(countMatch![0]); // Remove the exact match
    } else {
        detailPart = "Rare";
    }
  } else if (detectedRank) {
    heroPart = detectedRank + " Rank";
    usedTerms.push(detectedRank);
    
    if (extractedCount) {
        detailPart = extractedCount;
        usedTerms.push(countMatch![0]);
    } else {
        detailPart = "Full Access";
    }
  } else if (extractedCount) {
    heroPart = extractedCount;
    usedTerms.push(countMatch![0]);
    detailPart = "Full Access";
  } else {
    heroPart = "High Value Account";
    detailPart = "Full Access";
  }

  // Build the [Hero] + [Detail] string
  let anchorSection = heroPart;
  if (detailPart && detailPart !== "Full Access" && detailPart !== "Rare") {
     anchorSection = `${heroPart} + ${detailPart}`;
  } else if (detailPart === "Rare") {
      anchorSection = heroPart; // Don't add "+ Rare" text
  }

  // --- STEP C: CONSTRUCT DESCRIPTION (Preserve Original Data) ---
  
  let description = rawTitle;

  // 1. Remove the terms we moved to the Anchor to avoid duplication
  usedTerms.forEach(term => {
      // Use regex to replace case-insensitive occurrences
      description = description.replace(new RegExp(escapeRegExp(term), 'gi'), '');
  });

  // 2. Remove "Full Access" keywords (Since we add the [Full Access] prefix)
  REMOVAL_KEYWORDS.forEach(word => {
      description = description.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'), '');
  });

  // 3. Clean up formatting
  // Replace existing delimiters with a standard pipe
  description = description.replace(/[|,\-/_+]/g, ' | ');
  
  // Remove generic characters that might have been left behind like "Account" if it was "Fortnite Account"
  // (Optional: decide if we want to keep 'Account'. User said "keep same text", so we keep it mostly.)

  // Collapse multiple pipes and spaces
  description = description.replace(/\s*\|\s*/g, ' | '); 
  description = description.replace(/\s{2,}/g, ' '); 
  
  // Trim leading/trailing pipes and spaces
  description = description.replace(/^[\s|]+|[\s|]+$/g, '');

  // 4. Fallback
  if (!description.trim() || description.length < 3) {
      description = "Instant Delivery";
  } else {
      // Capitalize tokens for neatness
      description = description.split(' | ').map(segment => toTitleCase(segment.trim())).join(' | ');
  }

  // --- STEP D: FINAL ASSEMBLY ---
  // [Full Access] ✅ [Anchor] ✨ [Description] ⚡️ [Optional Suffix]

  let output = `[Full Access] ✅ ${anchorSection} ✨ ${description}`;

  // Only add Instant Delivery if we have space AND it's not already in the text
  const isShortEnough = output.length < 130;
  const hasInstant = description.toLowerCase().includes("instant") || description.toLowerCase().includes("delivery");
  
  if (isShortEnough && !hasInstant) {
    output += " ⚡️ Instant Delivery";
  }

  return output;
};
