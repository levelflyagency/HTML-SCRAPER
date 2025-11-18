
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

// List of title prefixes to automatically filter out.
const titlePrefixesToFilter = [
  '20 Accounts with 100+ Skins',
  '20 Accounts with 50+ Skins',
  'Fortnite - Surprise Account',
  'Fortnite [300+ 5x and 500+ 1x]',
  'Fortnite Account | Platforms - Available',
  'Fortnite account [20+ Skins]',
  'Individual offer for a personal order',
  'NEW 100+ 20x Price for one',
  'NEW 20+ 20x Price for one',
  'NEW 200+ 10x Price for one',
  'NEW 200+ 20x Price for one',
  'NEW 50+ 20x Price for one',
  'Total 120x Accounts',
  'Unchained Ramirez - Fortnite',
  'OFFER: 25x [LA] 10+ Skins',
  'OFFER: 20x [EU] 10+ Skins',
  'OFFER: 20x [EU] 20+ Skins',
  '10x [EUW 30+ LVL] 10+ Skins',
  '10x [EUW 30+ LVL] 25+ Skins',
  '10x [EUW 30+ LVL] 50+ Skins',
  '10x [EUW 30+ LVL] 100+ Skins',
  '10x [NA 30+ LVL] 10+ Skins',
  '10x [NA 30+ LVL] 25+ Skins',
  '10x [EUNE 30+ LVL] 10+ Skins',
  '10x [EUNE 30+ LVL] 25+ Skins',
  '10x [EUNE 30+ LVL] 50+ Skins',
  '10x [EUNE 30+ LVL] 100+ Skins',
];

export const scrapeProductsFromHtml = (html: string): { 
  products: Product[], 
  duplicatesRemovedCount: number, 
  removedDuplicates: Product[],
  filteredOutCount: number,
  filteredOutProducts: Product[] 
} => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const rawProducts: Product[] = [];
    
    // Attempt to scrape with the first set of selectors (original structure)
    let productElements = doc.querySelectorAll('.col-sm-6.col-md-3.col-xs-12');
    if (productElements.length > 0) {
      productElements.forEach(element => {
        const titleElement = element.querySelector('.text-body1.text-word-break span');
        const priceElement = element.querySelector('.text-body1.text-weight-medium');
        const currencyElement = element.querySelector('.text-caption.q-ml-xs');

        if (titleElement && priceElement && currencyElement) {
          const title = titleElement.textContent?.trim() || 'No Title Found';
          const priceText = priceElement.textContent?.trim();
          const price = priceText ? parseFloat(priceText) : 0;
          const currency = currencyElement.textContent?.trim() || 'N/A';
          
          if (!isNaN(price)) {
            rawProducts.push({ title, price, currency });
          }
        }
      });
    }

    // If the first set failed, try the second set of selectors (new structure)
    if (rawProducts.length === 0) {
      productElements = doc.querySelectorAll('a.tab1-item');
      productElements.forEach(element => {
        const titleElement = element.querySelector('.el-text.is-line-clamp');
        const priceElement = element.querySelector('.item-money p:first-child');
        const currencyElement = element.querySelector('.item-money p:nth-child(2)');
        const platformElement = element.querySelector('.item-tag div:first-child');

        if (titleElement && priceElement) {
          const title = titleElement.getAttribute('title')?.trim() || titleElement.textContent?.trim() || 'No Title Found';
          const priceText = priceElement.textContent?.trim();
          const price = priceText ? parseFloat(priceText) : 0;
          const currency = currencyElement?.textContent?.trim() || 'USD'; // Defaulting as it's common
          const platform = platformElement?.textContent?.trim() || undefined;
          
          if (!isNaN(price)) {
            rawProducts.push({ title, price, currency, platform });
          }
        }
      });
    }

    // If the first two sets failed, try the third set for review items
    if (rawProducts.length === 0) {
      productElements = doc.querySelectorAll('div.tab2-item');
      productElements.forEach(element => {
        const pElements = element.querySelectorAll('p');
        // In the review item structure, the product title is the last <p> tag.
        const titleElement = pElements.length > 1 ? pElements[pElements.length - 1] : null;

        if (titleElement) {
          const title = titleElement.textContent?.trim() || 'No Title Found';
          const price = 0; // No price in review items
          const currency = 'N/A'; // No currency
          
          let platform: string | undefined = undefined;
          const lowerCaseTitle = title.toLowerCase();
          const platforms: string[] = [];
          if (lowerCaseTitle.includes('pc')) platforms.push('PC');
          if (lowerCaseTitle.includes('xbox')) platforms.push('XBOX');
          if (lowerCaseTitle.includes('psn') || lowerCaseTitle.includes('ps')) platforms.push('PS');
          if (platforms.length > 0) platform = platforms.join('/');

          rawProducts.push({ title, price, currency, platform });
        }
      });
    }

    // Filter out products based on title prefixes or title length
    const filteredOutProducts: Product[] = [];
    const productsAfterFiltering = rawProducts.filter(product => {
        const startsWithPrefix = titlePrefixesToFilter.some(prefix => product.title.startsWith(prefix));
        const isTooShort = product.title.length < 14;
        const shouldFilter = startsWithPrefix || isTooShort;
        
        if (shouldFilter) {
            filteredOutProducts.push(product);
        }
        return !shouldFilter;
    });
    const filteredOutCount = filteredOutProducts.length;

    // Filter out duplicates from the remaining products
    const seenTitles = new Set<string>();
    const uniqueProducts: Product[] = [];
    const removedDuplicates: Product[] = [];

    productsAfterFiltering.forEach(product => {
      if (seenTitles.has(product.title)) {
        removedDuplicates.push(product);
      } else {
        seenTitles.add(product.title);
        uniqueProducts.push(product);
      }
    });
    
    const duplicatesRemovedCount = removedDuplicates.length;

    return { products: uniqueProducts, duplicatesRemovedCount, removedDuplicates, filteredOutCount, filteredOutProducts };

  } catch (error) {
    console.error("Error parsing HTML:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to parse HTML content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while parsing HTML.");
  }
};

export const scrapeProductsWithGemini = async (html: string): Promise<{ products: Product[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze the following HTML to extract product information. The HTML could contain either direct product listings or a list of seller reviews that mention products.

    From each item, extract the following details:
    - title: The full title of the product. For review items, this is the title of the product being reviewed.
    - price: The numerical price. If no price is found (like in a review item), use 0.
    - currency: The currency code (e.g., USD). If no currency is found, use "N/A".
    - platform: The gaming platform if specified (e.g., PC, XBOX, PS, PSN). This may be in a dedicated tag or part of the title. If not found, omit this field.

    Pay attention to two main structures:
    1. Product listings, often in 'a.tab1-item' elements. These will have titles, prices, and platforms.
    2. Review listings, often in 'div.tab2-item' elements. These will have a product title (usually the last <p> tag) but no price.

    Return the data as a JSON object with a single "products" key, which is an array of product objects.
    Here is the HTML content:
    ${html}
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      products: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The full title of the product.",
            },
            price: {
              type: Type.NUMBER,
              description: "The price of the product as a number.",
            },
            currency: {
              type: Type.STRING,
              description: "The currency of the price (e.g., USD).",
            },
            platform: {
              type: Type.STRING,
              description: "The gaming platform, if specified (e.g., PC, XBOX, PSN). Optional.",
            },
          },
          required: ["title", "price", "currency"],
        },
      },
    },
    required: ["products"],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonString = response.text.trim();
    if (!jsonString) {
      console.warn("Gemini API returned an empty response.");
      return { products: [] };
    }

    const parsed = JSON.parse(jsonString);

    if (parsed && Array.isArray(parsed.products)) {
        return { products: parsed.products };
    } else {
        console.error("Parsed JSON does not match expected schema:", parsed);
        throw new Error("Failed to parse products from AI response. The structure was incorrect.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Error from Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while scraping with Gemini.");
  }
};

export const rewriteTitlesWithGemini = async (titles: string[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Use flash for speed on text tasks
  const model = "gemini-2.5-flash";

  // Filter out empty lines
  const validTitles = titles.filter(t => t.trim().length > 0);

  if (validTitles.length === 0) return [];

  const prompt = `
    You are a Title Optimizer for gaming accounts. Your goal is to rewrite raw titles into a specific sales format while retaining MAXIMUM information from the user's input.

    ### 1. THE FORMAT STRUCTURE
    "[Full Access] ✅ [HERO_SKIN] + [TOTAL_COUNT] ✨ [ALL_OTHER_SKINS]" (+ Optional Delivery Suffix)

    ### 2. CRITICAL RULES (Read Carefully)

    **RULE A: The "Anchor" is Mandatory**
    * ALWAYS start with: \`[Full Access] ✅\`
    * Remove "Full Access", "FA", "Access" from the rest of the text to save space.

    **RULE B: The "Hero" Comes First**
    * Identify the Best Skin (e.g., Deadpool, The Reaper, Black Knight) OR the Total Skin Count.
    * Place this immediately after the ✅.
    * Format: \`[Best Skin] + [Total Skins]\` (e.g., "Deadpool + 57 Skins").

    **RULE C: Maximize Skin Retention (High Priority)**
    * After the Hero and the ✨ separator, list as many remaining skins from the input as possible.
    * **DO NOT CUT SKINS** unless you absolutely hit the 150-character limit.
    * Use \`|\` or \`,\` to separate skins to save space.

    **RULE D: The Delivery Suffix is OPTIONAL (Low Priority)**
    * Only add \`⚡️ Instant Delivery\` at the end **IF** you have enough space remaining (Total < 130 chars).
    * **NEVER** delete a skin name just to fit "Instant Delivery".
    * If the title is full of skins, omit the ⚡️ suffix entirely.

    ### 3. EXECUTION LOGIC
    1.  Write: \`[Full Access] ✅\`
    2.  Add: \`[Hero Skin] + [Count]\`
    3.  Add: \` ✨ \`
    4.  Fill remaining space (up to 150 chars) with all other skin names from input.
    5.  Check remaining space. If > 20 chars left, Add: \` ⚡️ Instant Delivery\`. Else, STOP.

    ### 4. EXAMPLES

    **Input (Short - Fits everything):**
    57 SKINS | Catalyst | Snap | Deadpool | Hybrid | Sparkle Supreme | X-Lord | Fusion
    **Output:**
    [Full Access] ✅ Deadpool + 57 Skins ✨ Catalyst | Snap | Hybrid | Sparkle Supreme | X-Lord | Fusion ⚡️ Instant Delivery

    **Input (Long - Drops Delivery to save Skins):**
    208 SKINS | The Reaper | Take The L | Mako Glider | Leviathan Axe | Elite Agent | Trinity Trooper | Major Glory | Blue Squire
    **Output:**
    [Full Access] ✅ The Reaper + 208 Skins ✨ Take The L | Mako Glider | Leviathan Axe | Elite Agent | Trinity Trooper | Major Glory | Blue Squire

    **Input:**
    44 SKINS | Omegarok | Peter Griffin | Spectra Knight | Valeria | Dupli-Kate | Santa Dogg | The Brat
    **Output:**
    [Full Access] ✅ Peter Griffin + 44 Skins ✨ Omegarok | Spectra Knight | Valeria | Dupli-Kate | Santa Dogg | The Brat ⚡️ Instant Delivery

    ### YOUR TASK:
    Rewrite the following raw titles adhering strictly to the logic above (Max 150 Chars).
    
    Input Titles:
    ${JSON.stringify(validTitles)}
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      rewrittenTitles: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: ["rewrittenTitles"],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.rewrittenTitles || [];
  } catch (error) {
    console.error("Error rewriting titles:", error);
    throw new Error("Failed to rewrite titles with AI.");
  }
};
