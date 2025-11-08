import React, { useState } from 'react';
import { Product } from '../types';

interface CleanTitlesPageProps {
  products: Product[];
}

const CleanTitlesPage: React.FC<CleanTitlesPageProps> = ({ products }) => {
  const [originalCopyText, setOriginalCopyText] = useState('Copy All');
  const [cleanedCopyText, setCleanedCopyText] = useState('Copy All');

  // Apply the cleaning rules to the product titles
  const cleanedProducts: Product[] = products.map(product => {
    let cleanedTitle = product.title
      .replace(/•/g, '|')
      .replace(/【/g, '[')
      .replace(/】/g, '] ');

    // Remove any character that is not an alphanumeric, a space, or one of the allowed symbols
    cleanedTitle = cleanedTitle.replace(/[^a-zA-Z0-9\s|\[\]\-%+&.,:/]/g, '');
    
    // Condense multiple spaces into one and trim whitespace
    cleanedTitle = cleanedTitle.replace(/\s\s+/g, ' ').trim();

    return {
      ...product,
      title: cleanedTitle,
    };
  });

  const handleCopy = (data: Product[], setText: React.Dispatch<React.SetStateAction<string>>) => {
    if (data.length === 0) return;

    const header = "Title\tPrice\n";
    const tsvContent = data
      .map(p => `${p.title.replace(/\s+/g, ' ')}\t${p.price.toFixed(2)}`)
      .join('\n');
    
    const fullContent = header + tsvContent;
  
    navigator.clipboard.writeText(fullContent).then(() => {
      setText('Copied!');
      setTimeout(() => setText('Copy All'), 2000);
    }).catch(err => {
      console.error('Failed to copy TSV to clipboard:', err);
    });
  };


  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center min-h-[calc(100vh-200px)] animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-gray-300">No Titles to Clean</h2>
        <p>Go to the <span className="font-semibold text-brand-primary">Scraper</span> page and extract some product data first.</p>
      </div>
    );
  }

  const ListHeader: React.FC = () => (
    <div className="grid grid-cols-12 gap-4 px-3 pb-2 border-b border-base-300 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <div className="col-span-10">Product Title</div>
        <div className="col-span-2 text-right">Price</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Title Cleaning Workbench</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original Titles Panel */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Original Titles ({products.length})</h3>
            <button
              onClick={() => handleCopy(products, setOriginalCopyText)}
              className="px-4 py-2 border border-base-300 text-sm font-medium rounded-md text-gray-300 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-300 transition-colors disabled:opacity-50"
              disabled={originalCopyText === 'Copied!' || products.length === 0}
            >
              {originalCopyText}
            </button>
          </div>
          <div className="bg-base-200/50 p-4 rounded-lg flex-grow border border-base-300 min-h-[400px] lg:min-h-[600px] flex flex-col">
            <ListHeader />
            <ul className="space-y-2 mt-2 flex-grow overflow-y-auto">
              {products.map((product, index) => {
                const isTitleLong = product.title.length > 150;
                return (
                  <li
                    key={index}
                    className={`grid grid-cols-12 gap-4 items-center bg-base-200 p-3 rounded text-sm border-l-4 transition-colors hover:bg-base-300/50 ${
                      isTitleLong ? 'border-amber-500' : 'border-base-300'
                    }`}
                    title={product.title}
                  >
                    <div className="col-span-10 flex items-center space-x-3 min-w-0">
                        {isTitleLong && (
                        <div className="flex-shrink-0" title="Title is longer than 150 characters.">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        )}
                        <span className="truncate">{product.title}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-gray-300">
                        {product.price.toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Cleaned Titles Panel */}
        <div className="flex flex-col space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-xl font-semibold">Cleaned Titles ({cleanedProducts.length})</h3>
             <button
              onClick={() => handleCopy(cleanedProducts, setCleanedCopyText)}
              className="px-4 py-2 border border-base-300 text-sm font-medium rounded-md text-gray-300 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-300 transition-colors disabled:opacity-50"
              disabled={cleanedCopyText === 'Copied!' || cleanedProducts.length === 0}
            >
              {cleanedCopyText}
            </button>
           </div>
           <div className="bg-base-200/50 p-4 rounded-lg flex-grow border border-base-300 min-h-[400px] lg:min-h-[600px] flex flex-col">
              <ListHeader />
              <ul className="space-y-2 mt-2 flex-grow overflow-y-auto">
                {cleanedProducts.map((product, index) => (
                  <li
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center bg-base-200 p-3 rounded text-sm border-l-4 transition-colors hover:bg-base-300/50 border-brand-secondary"
                    title={product.title}
                  >
                    <div className="col-span-10 flex items-center space-x-3 min-w-0">
                      <span className="truncate">{product.title}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-gray-300">
                      {product.price.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CleanTitlesPage;