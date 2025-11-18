
import React, { useState, useCallback } from 'react';
import { Product } from '../types';
import { scrapeProductsWithGemini } from '../services/geminiService';
import { BrainCircuit, Trash2, Copy, Code2, AlertCircle, Layers, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full flex-col gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-purple-900/50"></div>
        <div className="w-12 h-12 rounded-full border-2 border-neon-purple border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="text-xs text-neon-purple animate-pulse">AI Analyzing DOM...</span>
    </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center text-slate-500 p-12 border-2 border-dashed border-slate-700/50 rounded-xl h-full flex flex-col justify-center items-center bg-slate-900/30">
    <BrainCircuit className="w-16 h-16 mb-4 opacity-50 text-neon-purple" />
    <h3 className="text-xl font-semibold text-slate-300 mb-2">AI Extraction</h3>
    <p className="text-sm max-w-xs mx-auto">Paste HTML. The AI will intelligently identify products, even in complex or broken layouts.</p>
  </div>
);

interface ScraperPageV2Props {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  scrapedData: Product[];
  setScrapedData: (data: Product[]) => void;
  setRemovedDuplicates: (data: Product[]) => void;
  setFilteredOutProducts: (data: Product[]) => void;
  showToast: (msg: string) => void;
}

const ScraperPageV2: React.FC<ScraperPageV2Props> = ({ 
  htmlContent, 
  setHtmlContent, 
  scrapedData, 
  setScrapedData,
  setRemovedDuplicates,
  setFilteredOutProducts,
  showToast
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("The AI could not extract any products. Try checking the HTML.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "AI Processing Error.";
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
    
    navigator.clipboard.writeText(header + tsvContent).then(() => {
      showToast('AI extracted data copied!');
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
           <div className="flex items-center gap-2 text-neon-purple mb-1">
                <Code2 className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-wide uppercase">HTML Source (AI)</h2>
            </div>

            <div className="relative flex-grow flex flex-col rounded-xl overflow-hidden shadow-2xl border border-glass-border bg-[#0B1120]">
                 <div className="bg-slate-900/80 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="ml-2 text-xs font-mono text-slate-500">dom_dump.html</span>
                </div>
                 <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<!-- Paste raw HTML here for AI analysis -->"
                    className="w-full flex-grow p-4 bg-transparent text-slate-300 font-mono text-xs lg:text-sm outline-none resize-none placeholder:text-slate-700 leading-relaxed"
                />
            </div>
            
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleScrape}
                    disabled={isLoading}
                    className="flex-1 group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 fill-current" />
                            <span>SCRAPE WITH GEMINI AI</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleClear}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/5 transition-colors flex items-center justify-center"
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
                <div className="flex items-center gap-2 text-white">
                    <Layers className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-wide uppercase">AI Results</h2>
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

             {scrapedData.length > 0 && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm text-center">
                    <p className="text-xl font-bold text-neon-purple">{scrapedData.length}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Items Identified</p>
                </div>
            )}

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
                         <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-[#0B1120]/95 backdrop-blur-sm z-10">
                            <div className="col-span-8">Product</div>
                            <div className="col-span-2 text-center">Platform</div>
                            <div className="col-span-2 text-right">Price</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {scrapedData.map((product, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
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
                                    <div className="col-span-2 text-right font-mono text-neon-purple">
                                        {product.price.toFixed(2)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </motion.div>
    </div>
  );
};

export default ScraperPageV2;
