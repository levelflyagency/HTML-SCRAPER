import React, { useState, useCallback } from 'react';
import { Product } from '../types';
import { scrapeProductsWithGemini } from '../services/geminiService';

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center text-gray-400 p-8 border-2 border-dashed border-gray-600 rounded-lg h-full flex flex-col justify-center items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h3 className="text-xl font-semibold text-gray-300">No data yet</h3>
    <p>Paste your HTML and click "Scrape with AI" to see the results.</p>
  </div>
);

interface ScraperPageV2Props {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  scrapedData: Product[];
  setScrapedData: (data: Product[]) => void;
  setRemovedDuplicates: (data: Product[]) => void;
  setFilteredOutProducts: (data: Product[]) => void;
}

const ScraperPageV2: React.FC<ScraperPageV2Props> = ({ 
  htmlContent, 
  setHtmlContent, 
  scrapedData, 
  setScrapedData,
  setRemovedDuplicates,
  setFilteredOutProducts
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy All');

  const handleScrape = useCallback(async () => {
    if (!htmlContent.trim()) {
      setError("HTML content cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setScrapedData([]);
    setRemovedDuplicates([]);
    setFilteredOutProducts([]);

    try {
      const { products } = await scrapeProductsWithGemini(htmlContent);
      setScrapedData(products);

      if (products.length === 0) {
        setError("The AI could not extract any products. The HTML might be empty or not contain product information.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during AI processing.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [htmlContent, setScrapedData, setRemovedDuplicates, setFilteredOutProducts]);

  const handleClear = () => {
    setHtmlContent('');
    setScrapedData([]);
    setRemovedDuplicates([]);
    setFilteredOutProducts([]);
    setError(null);
  }

  const handleCopyAll = () => {
    if (scrapedData.length === 0) return;
  
    const header = "Title\tPlatform\tPrice\n";
    const tsvContent = scrapedData
      .map(p => `${p.title.replace(/\s+/g, ' ')}\t${p.platform || ''}\t${p.price.toFixed(2)}`)
      .join('\n');
    
    const fullContent = header + tsvContent;
  
    navigator.clipboard.writeText(fullContent).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy All'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy data to clipboard.');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        {/* Input Panel */}
        <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold">HTML Input (AI Scraper)</h2>
        <div className="flex-grow flex">
            <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste your HTML code here..."
            className="w-full h-full min-h-[400px] lg:min-h-[600px] p-4 bg-base-200 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 resize-none font-mono text-sm"
            />
        </div>
        <div className="flex space-x-4">
            <button
                onClick={handleScrape}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scraping...
                    </>
                ) : (
                    <>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                        Scrape with AI
                    </>
                )}
            </button>
                <button
                onClick={handleClear}
                className="px-6 py-3 border border-base-300 text-base font-medium rounded-md text-gray-300 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
                Clear
            </button>
        </div>
        </div>
        
        {/* Output Panel */}
        <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Extracted Data</h2>
            {scrapedData.length > 0 && (
            <button
                onClick={handleCopyAll}
                className="px-4 py-2 border border-base-300 text-sm font-medium rounded-md text-gray-300 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                disabled={copyButtonText === 'Copied!'}
            >
                {copyButtonText}
            </button>
            )}
        </div>
        {scrapedData.length > 0 && (
            <div className="grid grid-cols-1 gap-4 text-center p-4 bg-base-300/50 rounded-lg animate-fade-in">
                <div>
                    <p className="text-2xl lg:text-3xl font-bold text-green-400">{scrapedData.length}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Products Found</p>
                </div>
            </div>
        )}
        <div className="bg-base-200/50 p-4 rounded-lg flex-grow border border-base-300 min-h-[400px] lg:min-h-[520px]">
            {isLoading ? (
            <Spinner />
            ) : error ? (
            <div className="text-red-400 bg-red-900/20 p-4 rounded-lg h-full flex items-center justify-center text-center">
                {error}
            </div>
            ) : scrapedData.length > 0 ? (
                <div className="space-y-2 h-full overflow-y-auto pr-2">
                    <div className="grid grid-cols-12 gap-4 px-2 pb-2 border-b border-base-300 text-sm font-semibold text-gray-400 sticky top-0 bg-base-200/50 py-2">
                        <div className="col-span-8">Title</div>
                        <div className="col-span-2 text-center">Platform</div>
                        <div className="col-span-2 text-right">Price</div>
                    </div>
                    <ul className="space-y-2">
                        {scrapedData.map((product, index) => (
                        <li
                            key={index}
                            className="grid grid-cols-12 gap-4 items-center bg-base-200 p-2 rounded text-sm"
                            title={product.title}
                        >
                            <div className="col-span-8 truncate">
                                {product.title}
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="bg-base-300/80 rounded-full px-3 py-1 text-xs font-medium text-gray-300">{product.platform || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 text-right font-mono font-semibold text-secondary">
                                {product.price.toFixed(2)}
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>
            ) : (
            <EmptyState />
            )}
        </div>
        </div>
    </div>
  );
};

export default ScraperPageV2;