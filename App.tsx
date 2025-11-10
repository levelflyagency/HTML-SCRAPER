import React, { useState } from 'react';
import ScraperPage from './pages/ScraperPage';
import CleanTitlesPage from './pages/CleanTitlesPage';
import { Product } from './types';

type Page = 'scraper' | 'cleaner';

const initialHtml = `<html lang="en" class="dark"><head><style class="vjs-styles-defaults">
      .video-js {
        width: 300px;
        height: 150px;
      }

      .vjs-fluid:not(.vjs-audio-only-mode) {
        padding-top: 56.25%
      }
    </style><meta charset="UTF-8"><script async="" src="https://www.clarity.ms/tag/qjgc94o507"></script><script async="" src="https://www.googletagmanager.com/gtm.js?id=GTM-TRXQZ98"></script><script>window.prerenderReady = false;</script><meta name="theme-color" content="#050509"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="google-site-verification" content="e6Yi-tP93oN5bNRtidMT83l-gxF4XCxKfgNQOXnUUkw"><link rel="prefetch" as="image" href="/favicon.ico"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,viewport-fit=cover"><link rel="dns-prefetch" href="https://www.u7buy.com"><link rel="dns-prefetch" href="https://static.u7buy.com"><link rel="dns-prefetch" href="https://image1.u7buy.com"><link rel="dns-prefetch" href="https://image2.u7buy.com"><link rel="dns-prefetch" href="https://image3.u7buy.com"><link rel="dns-prefetch" href="https://image4.u7buy.com"><link rel="dns-prefetch" href="https://image5.u7buy.com"><link rel="dns-prefetch" href="https://image6.u7buy.com"><link rel="dns-prefetch" href="https://image7.u7buy.com"><link rel="dns-prefetch" href="https://image8.u7buy.com"><link rel="dns-prefetch" href="https://image9.u7buy.com"><link rel="dns-prefetch" href="https://image10.u7buy.com"><link rel="dns-prefetch" href="https://www.google-analytics.com"><link rel="dns-prefetch" href="https://www.google.com"><link rel="dns-prefetch" href="https://td.doubleclick.net"><link rel="dns-prefetch" href="https://www.clarity.ms"><link rel="dns-prefetch" href="https://www.googletagmanager.com"><link rel="preload" href="/assets/ttf/icomoon-vi3vNcN4.ttf" as="font" type="font/ttf" crossorigin=""><link rel="preload" href="/assets/woff2/Poppins-Regular-Bv-pP9mb.woff2" as="font" type="font/woff2" crossorigin=""><link rel="preload" href="/assets/woff2/Poppins-SemiBold-CIR-BGmX.woff2" as="font" type="font/woff2" crossorigin=""><link rel="preload" href="/assets/woff2/Poppins-Dqk6oVHb.woff2" as="font" type="font/woff2" crossorigin=""><link rel="preload" href="/assets/woff2/DingTalk-Sans-Z4DPGVXy.woff2" as="font" type="font/woff2" crossorigin=""><link rel="preload" fetchpriority="high" as="image" href="`;

// Fix: The original App.tsx was incomplete and missing the component definition and default export.
// This new implementation defines the App component, manages application state,
// and handles navigation between the Scraper and Cleaner pages, resolving the import error.
const App: React.FC = () => {
  const [page, setPage] = useState<Page>('scraper');
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml.trim());
  const [scrapedData, setScrapedData] = useState<Product[]>([]);
  const [removedDuplicates, setRemovedDuplicates] = useState<Product[]>([]);
  const [filteredOutProducts, setFilteredOutProducts] = useState<Product[]>([]);

  const NavButton: React.FC<{ targetPage: Page; children: React.ReactNode }> = ({ targetPage, children }) => (
    <button
      onClick={() => setPage(targetPage)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        page === targetPage
          ? 'bg-primary text-white'
          : 'bg-base-200 text-gray-300 hover:bg-base-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-base-100 text-gray-100 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Web Scraper & Title Cleaner
          </h1>
          <p className="text-center text-gray-400">
            A simple tool to extract product data and clean up titles.
          </p>
        </header>
        
        <nav className="flex justify-center space-x-4 mb-8">
          <NavButton targetPage="scraper">1. Scraper</NavButton>
          <NavButton targetPage="cleaner">2. Title Cleaner</NavButton>
        </nav>

        <main>
          {page === 'scraper' && (
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
          {page === 'cleaner' && <CleanTitlesPage products={scrapedData} />}
        </main>
      </div>
    </div>
  );
};

export default App;
