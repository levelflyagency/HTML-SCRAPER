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

        if (titleElement && priceElement) {
          const title = titleElement.getAttribute('title')?.trim() || titleElement.textContent?.trim() || 'No Title Found';
          const priceText = priceElement.textContent?.trim();
          const price = priceText ? parseFloat(priceText) : 0;
          const currency = currencyElement?.textContent?.trim() || 'USD'; // Defaulting as it's common
          
          if (!isNaN(price)) {
            rawProducts.push({ title, price, currency });
          }
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
