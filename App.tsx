import React, { useState, useEffect } from 'react';
import ScraperPage from './pages/ScraperPage';
import CleanTitlesPage from './pages/CleanTitlesPage';
import { Product } from './types';

type Page = 'scraper' | 'cleaner';

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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('scraper');
  const [scrapedData, setScrapedData] = useState<Product[]>([]);
  const [removedDuplicates, setRemovedDuplicates] = useState<Product[]>([]);
  const [filteredOutProducts, setFilteredOutProducts] = useState<Product[]>([]);
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      const message = "Same data will be lose";
      event.returnValue = message; 
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
            htmlContent={htmlContent}
            setHtmlContent={setHtmlContent}
            scrapedData={scrapedData}
            setScrapedData={setScrapedData}
            removedDuplicates={removedDuplicates}
            setRemovedDuplicates={setRemovedDuplicates}
            filteredOutProducts={filteredOutProducts}
            setFilteredOutProducts={setFilteredOutProducts}
          />
        )}
        {currentPage === 'cleaner' && <CleanTitlesPage products={scrapedData} />}
      </main>
    </div>
  );
};

export default App;