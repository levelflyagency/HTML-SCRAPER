
import { Product } from '../types';

export const scrapeProductsFromHtml = (html: string): Product[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: Product[] = [];
    
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
          products.push({ title, price, currency });
        }
      }
    });

    return products;
  } catch (error) {
    console.error("Error parsing HTML:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to parse HTML content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while parsing HTML.");
  }
};
