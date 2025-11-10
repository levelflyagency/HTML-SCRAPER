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
    
    // This selector is tailored to the structure of the product cards in the initial HTML.
    const productElements = doc.querySelectorAll('.col-sm-6.col-md-3.col-xs-12');

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