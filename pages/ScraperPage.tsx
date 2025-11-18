
import React, { useState, useCallback } from 'react';
import { Product } from '../types';
import { scrapeProductsFromHtml } from '../services/geminiService';
import { Play, Trash2, Copy, Code2, AlertCircle, Layers, FilterX, CopyCheck, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700 opacity-50"></div>
        <div className="w-12 h-12 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center text-slate-500 p-12 border-2 border-dashed border-slate-700/50 rounded-xl h-full flex flex-col justify-center items-center bg-slate-900/30">
    <Terminal className="w-16 h-16 mb-4 opacity-50 text-neon-cyan" />
    <h3 className="text-xl font-semibold text-slate-300 mb-2">Awaiting Input</h3>
    <p className="text-sm max-w-xs mx-auto">Paste raw HTML code into the editor on the left to extract structured product data.</p>
  </div>
);

interface ScraperPageProps {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  scrapedData: Product[];
  setScrapedData: (data: Product[]) => void;
  removedDuplicates: Product[];
  setRemovedDuplicates: (data: Product[]) => void;
  filteredOutProducts: Product[];
  setFilteredOutProducts: (data: Product[]) => void;
  showToast: (msg: string) => void;
}

const ScraperPage: React.FC<ScraperPageProps> = ({ 
  htmlContent, 
  setHtmlContent, 
  scrapedData, 
  setScrapedData, 
  removedDuplicates, 
  setRemovedDuplicates, 
  filteredOutProducts, 
  setFilteredOutProducts,
  showToast
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState<boolean>(false);
  const [showFiltered, setShowFiltered] = useState<boolean>(false);

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
    setShowDuplicates(false);
    setShowFiltered(false);
    setNotification(null);

    await new Promise(resolve => setTimeout(resolve, 400)); // Slight delay for animation feel

    try {
      const { products, duplicatesRemovedCount, removedDuplicates, filteredOutCount, filteredOutProducts } = scrapeProductsFromHtml(htmlContent);
      setScrapedData(products);
      setRemovedDuplicates(removedDuplicates);
      setFilteredOutProducts(filteredOutProducts);

      const messages = [];
      if (filteredOutCount > 0) messages.push(`${filteredOutCount} generic items removed.`);
      if (duplicatesRemovedCount > 0) messages.push(`${duplicatesRemovedCount} duplicates removed.`);
      
      if (messages.length > 0) setNotification(messages.join(' '));

      if (products.length === 0 && filteredOutProducts.length === 0) {
        setError("No products found. Please check your HTML source.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Parsing error.";
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
    setNotification(null);
  }

  const handleCopyAll = () => {
    if (scrapedData.length === 0) return;
    const header = "Title\tPlatform\tPrice\n";
    const tsvContent = scrapedData
      .map(p => `${p.title.replace(/\s+/g, ' ')}\t${p.platform || ''}\t${p.price.toFixed(2)}`)
      .join('\n');
    
    navigator.clipboard.writeText(header + tsvContent).then(() => {
      showToast('Product data copied to clipboard!');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* INPUT PANEL */}
        <motion.div 
          className="flex flex-col space-y-4 h-full"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
            <div className="flex items-center gap-2 text-neon-cyan mb-1">
                <Code2 className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-wide uppercase">HTML Source</h2>
            </div>
            
            <div className="relative flex-grow flex flex-col rounded-xl overflow-hidden shadow-2xl border border-glass-border bg-[#0B1120]">
                {/* Fake Code Editor Header */}
                <div className="bg-slate-900/80 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="ml-2 text-xs font-mono text-slate-500">source.html</span>
                </div>
                <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<!-- Paste HTML content here -->"
                    className="w-full flex-grow p-4 bg-transparent text-slate-300 font-mono text-xs lg:text-sm outline-none resize-none placeholder:text-slate-700 leading-relaxed"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleScrape}
                    disabled={isLoading}
                    className="flex-1 group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            <span>RUN SCRAPER</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleClear}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/5 transition-colors flex items-center justify-center"
                    title="Clear All"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
        
        {/* OUTPUT PANEL */}
        <motion.div 
            className="flex flex-col space-y-4 h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-neon-purple">
                    <Layers className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-wide uppercase">Extracted Data</h2>
                </div>
                {scrapedData.length > 0 && (
                <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-white/10 transition-colors"
                >
                    <Copy className="w-3.5 h-3.5" />
                    Copy TSV
                </button>
                )}
            </div>

            {/* Stats Grid */}
            {(scrapedData.length > 0 || removedDuplicates.length > 0 || filteredOutProducts.length > 0) && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{scrapedData.length + removedDuplicates.length + filteredOutProducts.length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <p className="text-xl font-bold text-emerald-400">{scrapedData.length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Valid</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <p className="text-xl font-bold text-amber-400">{removedDuplicates.length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Dups</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <p className="text-xl font-bold text-rose-400">{filteredOutProducts.length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Filtered</p>
                    </div>
                </div>
            )}

            {/* Notification Banner */}
            {notification && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-xs flex justify-between items-center"
                >
                    <div className="flex items-center gap-2">
                        <FilterX className="w-4 h-4" />
                        <span>{notification}</span>
                    </div>
                    <div className="flex gap-2">
                        {filteredOutProducts.length > 0 && (
                            <button onClick={() => setShowFiltered(!showFiltered)} className="underline opacity-80 hover:opacity-100">
                                {showFiltered ? 'Hide' : 'Show'} Filtered
                            </button>
                        )}
                         {removedDuplicates.length > 0 && (
                            <button onClick={() => setShowDuplicates(!showDuplicates)} className="underline opacity-80 hover:opacity-100">
                                {showDuplicates ? 'Hide' : 'Show'} Dups
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Results List Container */}
            <div className="flex-grow relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <Spinner />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-rose-400 p-6 text-center">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-80" />
                        <p className="font-medium">{error}</p>
                    </div>
                ) : scrapedData.length > 0 ? (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-[#0B1120]/95 backdrop-blur-sm z-10">
                            <div className="col-span-8">Product</div>
                            <div className="col-span-2 text-center">Platform</div>
                            <div className="col-span-2 text-right">Price</div>
                        </div>
                        
                        {/* Table Body */}
                        <div className="divide-y divide-white/5">
                            {scrapedData.map((product, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.01 }}
                                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 text-sm hover:bg-white/5 transition-colors group"
                                >
                                    <div className="col-span-8 min-w-0">
                                        <p className="truncate font-medium text-slate-200 group-hover:text-white transition-colors">
                                            {product.title}
                                        </p>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        {product.platform && (
                                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 border border-white/5">
                                                {product.platform}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-neon-cyan">
                                        {product.price.toFixed(2)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState />
                )}

                {/* Hidden Overlays for Filtered/Dups (Conditional) */}
                {showFiltered && (
                    <div className="absolute inset-0 bg-[#0B1120] z-20 overflow-y-auto p-4 animate-fade-in">
                        <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Auto-Filtered Items</h3>
                        <ul className="space-y-2">
                            {filteredOutProducts.map((p, i) => (
                                <li key={i} className="text-xs text-slate-500 line-through">{p.title}</li>
                            ))}
                        </ul>
                    </div>
                )}
                 {showDuplicates && (
                    <div className="absolute inset-0 bg-[#0B1120] z-20 overflow-y-auto p-4 animate-fade-in">
                        <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2"><Copy className="w-4 h-4"/> Removed Duplicates</h3>
                         <ul className="space-y-2">
                            {removedDuplicates.map((p, i) => (
                                <li key={i} className="text-xs text-slate-500 line-through">{p.title}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
};

export default ScraperPage;
