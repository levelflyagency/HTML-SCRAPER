import React, { useState, useCallback } from 'react';
import { Product } from '../types';
import { scrapeProductsFromHtml } from '../services/geminiService';

const initialHtml = `<div class="row g-col-gutter-30">
  <div class="col-sm-6 col-md-3 col-xs-12">
    <div data-v-1df071b5="" class="full-height full-width relative-position bg-white bg-dark-black g-card-hover">
      <a data-v-1df071b5="" href="/some-link-1" class="full-height column g-card-no-deco">
        <div data-v-1df071b5="" class="q-pa-md">
          <div data-v-1df071b5="" class="text-body1 text-word-break ellipsis-2-lines">
            <span data-v-1df071b5="">[EU] HALLOWEEN DISCOUNT -61% | ST-II, M48 Patton | Cred:6 160 000| E68 | This is an example of a very long title that is definitely going to be more than 150 characters to properly test the new detection functionality we have just implemented.</span>
          </div>
        </div>
      </a>
      <div data-v-1df071b5="" class="q-px-md q-pb-md row items-center">
        <a data-v-1df071b5="" href="/some-link-1" class="q-ml-auto g-card-no-deco text-right">
          <span data-v-1df071b5="" class="text-body1 text-weight-medium">9.99</span>
          <span data-v-1df071b5="" class="text-caption q-ml-xs">USD</span>
        </a>
      </div>
    </div>
  </div>
   <div class="col-sm-6 col-md-3 col-xs-12">
    <div data-v-1df071b5="" class="full-height full-width relative-position bg-white bg-dark-black g-card-hover">
      <a data-v-1df071b5="" href="/some-link-1" class="full-height column g-card-no-deco">
        <div data-v-1df071b5="" class="q-pa-md">
          <div data-v-1df071b5="" class="text-body1 text-word-break ellipsis-2-lines">
            <span data-v-1df071b5="">[EU] HALLOWEEN DISCOUNT -61% | ST-II, M48 Patton | Cred:6 160 000| E68</span>
          </div>
        </div>
      </a>
      <div data-v-1df071b5="" class="q-px-md q-pb-md row items-center">
        <a data-v-1df071b5="" href="/some-link-1" class="q-ml-auto g-card-no-deco text-right">
          <span data-v-1df071b5="" class="text-body1 text-weight-medium">9.99</span>
          <span data-v-1df071b5="" class="text-caption q-ml-xs">USD</span>
        </a>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-md-3 col-xs-12">
    <div data-v-1df071b5="" class="full-height full-width relative-position bg-white bg-dark-black g-card-hover">
      <a data-v-1df071b5="" href="/some-link-2" class="full-height column g-card-no-deco">
        <div data-v-1df071b5="" class="q-pa-md">
          <div data-v-1df071b5="" class="text-body1 text-word-break ellipsis-2-lines">
            <span data-v-1df071b5="">[ASIA/FULL ACCESS] DISCOUNT -33% | Maus, Blyskawica | Cred:6 160 000| A63</span>
          </div>
        </div>
      </a>
      <div data-v-1df071b5="" class="q-px-md q-pb-md row items-center">
        <a data-v-1df071b5="" href="/some-link-2" class="q-ml-auto g-card-no-deco text-right">
          <span data-v-1df071b5="" class="text-body1 text-weight-medium">17.17</span>
          <span data-v-1df071b5="" class="text-caption q-ml-xs">USD</span>
        </a>
      </div>
    </div>
  </div>
</div>`;

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
    <p>Paste your HTML and click "Scrape" to see the results.</p>
  </div>
);

interface ScraperPageProps {
  scrapedData: Product[];
  setScrapedData: (data: Product[]) => void;
  removedDuplicates: Product[];
  setRemovedDuplicates: (data: Product[]) => void;
}

const ScraperPage: React.FC<ScraperPageProps> = ({ scrapedData, setScrapedData, removedDuplicates, setRemovedDuplicates }) => {
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy All');
  const [notification, setNotification] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState<boolean>(false);

  const handleScrape = useCallback(async () => {
    if (!htmlContent.trim()) {
      setError("HTML content cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setScrapedData([]);
    setRemovedDuplicates([]);
    setShowDuplicates(false);
    setNotification(null);

    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const { products, duplicatesRemovedCount, removedDuplicates } = scrapeProductsFromHtml(htmlContent);
      setScrapedData(products);
      setRemovedDuplicates(removedDuplicates);

      if (duplicatesRemovedCount > 0) {
        const message = `${duplicatesRemovedCount} duplicate product(s) found and removed.`;
        setNotification(message);
      }

      if (products.length === 0) {
        setError("No products could be extracted. Check the HTML structure and selectors.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during parsing.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [htmlContent, setScrapedData, setRemovedDuplicates]);

  const handleClear = () => {
    setHtmlContent('');
    setScrapedData([]);
    setRemovedDuplicates([]);
    setError(null);
    setNotification(null);
    setShowDuplicates(false);
  }

  const handleCopyAll = () => {
    if (scrapedData.length === 0) return;
  
    const header = "Title\tPrice\tCurrency\n";
    const tsvContent = scrapedData
      .map(p => `${p.title.replace(/\s+/g, ' ')}\t${p.price}\t${p.currency}`)
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
        <h2 className="text-xl font-semibold">HTML Input</h2>
        <div className="flex-grow flex">
            <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste your HTML code here..."
            className="w-full h-full min-h-[400px] lg:min-h-[600px] p-4 bg-base-200 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all duration-300 resize-none font-mono text-sm"
            />
        </div>
        <div className="flex space-x-4">
            <button
                onClick={handleScrape}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
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
                            <path d="M15 9a2 2 0 10-4 0v5a2 2 0 004 0V9z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5a1 1 0 102 0V5z" clipRule="evenodd" />
                        </svg>
                        Scrape Products
                    </>
                )}
            </button>
                <button
                onClick={handleClear}
                className="px-6 py-3 border border-base-300 text-base font-medium rounded-md text-gray-300 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-300 transition-colors"
            >
                Clear
            </button>
        </div>
        </div>
        
        {/* Output Panel */}
        <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Extracted Data</h2>
            {scrapedData.length > 0 && (
            <button
                onClick={handleCopyAll}
                className="px-4 py-2 border border-base-300 text-sm font-medium rounded-md text-gray-300 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-300 transition-colors disabled:opacity-50"
                disabled={copyButtonText === 'Copied!'}
            >
                {copyButtonText}
            </button>
            )}
        </div>
        {notification && (
            <div className="bg-green-800/30 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg relative flex justify-between items-center text-sm" role="alert">
            <span>{notification}</span>
            {removedDuplicates.length > 0 && (
                <button 
                onClick={() => setShowDuplicates(s => !s)}
                className="ml-4 px-3 py-1 bg-green-600/50 hover:bg-green-500/50 rounded-md text-white font-semibold text-xs"
                aria-controls="duplicates-section"
                aria-expanded={showDuplicates}
                >
                {showDuplicates ? 'Hide' : 'View'} Duplicates
                </button>
            )}
            </div>
        )}
        <div className="bg-base-200/50 p-4 rounded-lg flex-grow border border-base-300 min-h-[400px] lg:min-h-[600px]">
            {isLoading ? (
            <Spinner />
            ) : error ? (
            <div className="text-red-400 bg-red-900/20 p-4 rounded-lg h-full flex items-center justify-center text-center">
                {error}
            </div>
            ) : scrapedData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 h-full">
                <div className="space-y-2 h-full overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold text-gray-300 sticky top-0 bg-base-200/50 py-2">Titles</h3>
                <ul className="space-y-2">
                    {scrapedData.map((product, index) => {
                    const isTitleLong = product.title.length > 150;
                    return (
                        <li
                        key={index}
                        className={`bg-base-200 p-2 rounded text-sm border-l-4 flex items-center space-x-2 ${
                            isTitleLong ? 'border-amber-500' : 'border-base-300'
                        }`}
                        title={product.title}
                        >
                        {isTitleLong && (
                            <div className="flex-shrink-0" title="Title is longer than 150 characters.">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            </div>
                        )}
                        <span className="truncate">{product.title}</span>
                        </li>
                    );
                    })}
                </ul>
                </div>
                <div className="space-y-2 h-full overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold text-gray-300 sticky top-0 bg-base-200/50 py-2">Prices</h3>
                <ul className="space-y-2">
                    {scrapedData.map((product, index) => (
                    <li key={index} className="bg-base-200 p-2 rounded text-sm border-l-4 border-brand-primary font-semibold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            ) : (
            <EmptyState />
            )}
        </div>
            <div className="text-sm text-gray-400 text-center">
            Found {scrapedData.length} unique products.
            </div>
            {showDuplicates && removedDuplicates.length > 0 && (
            <div id="duplicates-section" className="bg-base-200/50 p-4 rounded-lg border border-base-300 animate-fade-in">
            <h3 className="text-lg font-semibold text-amber-400 mb-3">Removed Duplicates ({removedDuplicates.length})</h3>
            <div className="max-h-40 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {removedDuplicates.map((product, index) => (
                        <li key={`dup-${index}`} className="bg-base-200 p-2 rounded text-sm text-gray-500 line-through flex justify-between items-center">
                            <span className="truncate pr-4" title={product.title}>{product.title}</span>
                            <span className="font-semibold text-gray-500 whitespace-nowrap">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default ScraperPage;