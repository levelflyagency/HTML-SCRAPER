import React, { useState } from 'react';
import ScraperPage from './pages/ScraperPage';
import CleanTitlesPage from './pages/CleanTitlesPage';
import { Product } from './types';

type Page = 'scraper' | 'cleaner';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('scraper');
  const [scrapedData, setScrapedData] = useState<Product[]>([]);
  const [removedDuplicates, setRemovedDuplicates] = useState<Product[]>([]);

  const NavLink: React.FC<{ page: Page; label: string; }> = ({ page, label }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        currentPage === page
          ? 'bg-brand-primary text-white'
          : 'text-gray-300 hover:bg-base-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-base-100 text-gray-200 font-sans">
      <header className="bg-base-200/50 backdrop-blur-sm shadow-lg sticky top-0 z-10 border-b border-base-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.074 6.843 5 7.29 5c.447 0 .778.074 1.05.222.272.148.48.347.636.596.157.249.235.538.235.867 0 .329-.078.638-.235.928a1.99 1.99 0 01-.635.635 2.577 2.577 0 01-1.05.255c-.447 0-.778-.086-1.05-.255a1.99 1.99 0 01-.636-.636 2.226 2.226 0 01-.235-.928c0-.329.078-.618.235-.867zm3.437 6.132c.157-.249.235-.538.235-.867 0-.329-.078-.638-.235-.928a1.99 1.99 0 00-.636-.636 2.577 2.577 0 00-1.05-.255c-.447 0-.778.086-1.05.255-.272.169-.48.38-.636.636a2.226 2.226 0 00-.235.928c0 .329.078.618.235.867.157.25.364.448.636.596.272.148.59.222 1.05.222.46 0 .788-.074 1.05-.222a1.99 1.99 0 00.635-.596z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold tracking-tight">Product Tools</h1>
          </div>
          <nav className="flex items-center space-x-2 bg-base-300/50 p-1 rounded-lg">
            <NavLink page="scraper" label="Scraper" />
            <NavLink page="cleaner" label="Clean Titles" />
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        {currentPage === 'scraper' && (
          <ScraperPage
            scrapedData={scrapedData}
            setScrapedData={setScrapedData}
            removedDuplicates={removedDuplicates}
            setRemovedDuplicates={setRemovedDuplicates}
          />
        )}
        {currentPage === 'cleaner' && <CleanTitlesPage products={scrapedData} />}
      </main>
    </div>
  );
};

export default App;