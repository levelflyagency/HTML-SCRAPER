
// UNIVERSAL GAMING DICTIONARIES

// 1. RARE ITEMS (Priority 1 for Hero Slot)
const HIGH_VALUE_ITEMS = [
  // --- SHOOTERS (Val/CS/Fortnite/Apex) ---
  "Kuronami", "Reaver", "Elderflame", "Prelude", "Araxys", "Glitchpop", "Prime", "Oni", "Singularity", 
  "Spectrum", "Champions", "Arcane", "Sheriff", "Vandal", "Phantom", "Operator", "Butterfly", "Karambit", 
  "Rgx", "Xenohunter", "Imperium", "Neo Frontier", "Gaia", "Mystbloom",
  "Dragon Lore", "Gungnir", "Prince", "Howl", "Fire Serpent", "Medusa", "Lotus", "Sapphire", "Ruby", "Emerald", 
  "Doppler", "Fade", "Tiger Tooth", "Marble Fade", "Case Hardened", "Gloves", "Knives", "Bayonet", "Talon", 
  "Skeleton", "Nomad", "Ursus", "Navaja", "Stiletto", "Paracord", "Survival", "Classic Knife",
  "Travis Scott", "Black Knight", "Ikonik", "Galaxy", "Glow", "Wonder", "Wildcat", "Renegade Raider", 
  "Aerial Assault", "Ghoul Trooper", "Skull Trooper", "The Reaper", "John Wick", "Minty", "Leviathan", 
  "Raiders Revenge", "Sparkle Specialist", "Royale Bomber", "Double Helix", "Honor Guard", "Stealth Reflex",
  "Heirloom", "Katar", "Buster Sword", "Final Fantasy",
  
  // --- MOBA / RPG (LoL/Genshin/Dota) ---
  "C6", "R5", "Arlecchino", "Furina", "Neuvillette", "Raiden", "Zhongli", "Nahida", "Yelan", "Hu Tao", 
  "Kazuha", "Xiao", "Ayaka", "Archon",
  "Pax", "Soulstealer", "Prestige", "Hextech", "God King", "Elementalist", "Spirit Blossom", "Ufo Corki", 
  "King Rammus", "Rusty Blitzcrank", "Championship Riven", "Arcana", "Persona",

  // --- SUPERCELL (CoC/CR/Brawl) ---
  "Hypercharge", "Mecha", "Phoenix Crow", "Star Shelly", "Gold Mecha", "Virus 8-Bit",
  "Pixel Skin", "Scenery", "Magic Items", "Hammer", 
  "Evolution", "Evo", "Elite Wild Cards", "Level 15", "Maxed Deck", "20 Wins",

  // --- ROBLOX / MINECRAFT ---
  "Korblox", "Headless", "Violet Valk", "Dominus", "Valkyrie", "Limiteds", "Extreme Headphones", "Blue Clockwork", "Sparkle Time", "Blox Fruits", "Kitsune", "Leopard", "Dragon", "Perm",
  "Minecon", "Optifine Cape", "Lunar Cape", "Badlion Cape", "MVP+", "MVP++", "Hypixel", "Skyblock", "Hyperion", "Terminator", "Gdrag", "Golden Dragon",

  // --- TANKS / MILITARY (WoT/War Thunder) ---
  "Object 279e", "T95/FV4201", "Chieftain", "Object 907", "VK 72.01", "Carro 45t", "Concept 1B", "Kpfpz 50t", "Type 59", "EBR 75", "Bourrasque", "Progetto 46", "BZ-176", "Waffentager", 
  "Maus", "IS-7",

  // --- GENERAL / STEAM ---
  "Steam Level", "Year Badge", "Years of Service", "No Vac", "Prime Status",
  "GTA V", "RDR2", "Cyberpunk", "Elden Ring", "Baldurs Gate 3", "God of War", "FIFA", "FC 24", "NBA 2K", "Call of Duty", "MW3", "Black Ops"
];

// 2. RANKS (Priority 2 for Hero Slot)
const RANKS = [
  // Valorant / LoL / TFT / WR
  "Radiant", "Immortal", "Ascendant", "Diamond", "Platinum", "Plat", "Gold", "Silver", "Bronze", "Iron",
  "Challenger", "Grandmaster", "Master", "Emerald", 
  // CS2 / Faceit
  "Global Elite", "Supreme", "LEM", "Eagle", "DMG", "Faceit 10", "Faceit Lvl 10",
  // Fortnite / Apex / Rocket League
  "Unreal", "Elite", "Champion", "Supersonic Legend", "SSL", "Grand Champion", "GC3", "GC2", "GC1", "Apex Predator", "Predator", "Top 500",
  // Clash / Brawl
  "Legends League", "Titan League", "Ultimate Champion", "Royal Champion", "Masters", "Legendary", "Mythic",
  // WoT
  "Unicum", "Super Unicum"
];

// 3. SPECIAL GAME METRICS (Regex Patterns)
// These capture things like "TH16", "Tier X", "50k Robux"
const METRIC_PATTERNS = [
    { regex: /\bTH\s*(\d+)\b/i, label: "TH" }, // Clash of Clans Town Hall
    { regex: /\bBH\s*(\d+)\b/i, label: "BH" }, // Builder Hall
    { regex: /\bTier\s*(X|10|IX|9|VIII|8)\b/i, label: "Tier" }, // World of Tanks
    { regex: /\b(Level|Lvl)\s*(\d+)\b/i, label: "Lvl" }, // Generic Level (CR/RPG)
    { regex: /\b(\d+)\s*(Trophies|Cups)\b/i, label: "Trophies" }, // Brawl/Clash
    { regex: /\b(\d+)\s*Wins\b/i, label: "Wins" }, // CR/Fortnite
    { regex: /\b(\d+)[\.,]?\d*k?\s*(Robux|Rap)\b/i, label: "Robux" }, // Roblox
    { regex: /\b(\d+)[\.,]?\d*k?\s*(V-?Bucks|Gems|Gold|Elixir)\b/i, label: "Currency" }, // Currencies
];

// 4. WORDS TO REMOVE (Strictly Redundant Access Terms only)
const REMOVAL_KEYWORDS = [
  "full access", "fa", "full ownership", "access", "email change", "mail change",
  "changeable", "original mail", "oge", "ownership", "verified"
];

// Helper to title case properly, keeping specific acronyms uppercase
const toTitleCase = (str: string) => {
  const upperAcronyms = ["CS2", "CSGO", "LOL", "NA", "EU", "OCE", "ASIA", "KR", "TR", "RU", "BR", "LATAM", "OG", "PBE", "AR", "MR", "PC", "PSN", "XBOX", "TH", "BH", "SSL", "GC", "MVP", "FC", "MW3", "GTA", "RDR2"];
  
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
  
  // 1. Detect Generic Count (Skins, Brawlers, Champs, Games)
  // Matches number + space + keyword
  const countRegex = /\b(\d+)\+?\s*(skins?|champs?|champions?|agents?|brawlers?|knives|gloves|games?|wins?|lvl|level|ar)\b/i;
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

  // 3. Detect Hero Item (Rare Skin/Unit)
  let heroItem: string | null = null;
  for (const item of HIGH_VALUE_ITEMS) {
    if (lowerTitle.includes(item.toLowerCase())) {
      heroItem = item;
      break; 
    }
  }

  // 4. Detect Special Game Metric (TH16, Tier X, Robux)
  let specialMetric: string | null = null;
  let specialMetricFull: string | null = null;
  for (const pattern of METRIC_PATTERNS) {
      const match = lowerTitle.match(pattern.regex);
      if (match) {
          // Format nicely: "TH 16" or "Tier X"
          if (pattern.label === "Currency" || pattern.label === "Robux") {
             specialMetricFull = toTitleCase(match[0]); // Keep "50k Robux"
             specialMetric = specialMetricFull;
          } else {
             // For TH/Tier, try to standardize spacing? match[0] is usually fine.
             specialMetricFull = match[0]; 
             // If it's just a number match like "16", append label
             if (pattern.label === "TH" || pattern.label === "BH" || pattern.label === "Tier") {
                 specialMetricFull = match[0].replace(/\s+/g, '').toUpperCase(); // TH16
             } else {
                 specialMetricFull = toTitleCase(match[0]);
             }
             specialMetric = specialMetricFull;
          }
          break;
      }
  }

  // --- STEP B: CONSTRUCT ANCHOR (The "Hero" Part) ---
  // Logic: Rare Item > Special Metric (TH/Tier) > Rank > Generic Count
  
  let heroPart = "";
  let detailPart = "";
  
  // Track what we use so we can remove it from the description later
  const usedTerms: string[] = [];

  // Determine Primary Hero
  if (heroItem) {
    heroPart = heroItem;
    usedTerms.push(heroItem);
    
    // Determine Secondary Detail
    if (specialMetric) {
        detailPart = specialMetric;
        usedTerms.push(specialMetricFull!); 
    } else if (detectedRank) {
        detailPart = detectedRank + " Rank";
        usedTerms.push(detectedRank);
    } else if (extractedCount) {
        detailPart = extractedCount;
        usedTerms.push(countMatch![0]);
    } else {
        detailPart = "Rare";
    }

  } else if (specialMetric) {
    // e.g. TH16, Tier X, 50k Robux
    heroPart = specialMetric;
    usedTerms.push(specialMetricFull!);

    if (detectedRank) {
        detailPart = detectedRank;
        usedTerms.push(detectedRank);
    } else if (extractedCount) {
        detailPart = extractedCount;
        usedTerms.push(countMatch![0]);
    } else {
        detailPart = "Maxed"; // Assumed for high metrics
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
  
  // Only add detail if it's not a generic placeholder
  if (detailPart && detailPart !== "Full Access" && detailPart !== "Rare" && detailPart !== "Maxed") {
     anchorSection = `${heroPart} + ${detailPart}`;
  } 
  // If we have a strong hero but no specific second stat, we might leave it as just Hero, 
  // or if it's a Metric like TH16, we might assume "Maxed" implies good.
  
  // Special cleanup for double "+"
  // e.g. if hero is "Black Knight + 200 Skins", we are good.

  // --- STEP C: CONSTRUCT DESCRIPTION (Preserve Original Data) ---
  
  let description = rawTitle;

  // 1. Remove the terms we moved to the Anchor to avoid duplication
  usedTerms.forEach(term => {
      // Use regex to replace case-insensitive occurrences
      // We need to be careful with short terms like "TH", but most usedTerms are specific.
      // escapeRegExp helps.
      description = description.replace(new RegExp(escapeRegExp(term), 'gi'), '');
  });

  // 2. Remove "Full Access" keywords (Since we add the [Full Access] prefix)
  REMOVAL_KEYWORDS.forEach(word => {
      description = description.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'), '');
  });

  // 3. Clean up formatting
  // Replace existing delimiters with a standard pipe
  description = description.replace(/[|,\-/_+]/g, ' | ');
  
  // Collapse multiple pipes and spaces
  description = description.replace(/\s*\|\s*/g, ' | '); 
  description = description.replace(/\s{2,}/g, ' '); 
  
  // Trim leading/trailing pipes and spaces
  description = description.replace(/^[\s|]+|[\s|]+$/g, '');

  // 4. Fallback & Formatting
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
