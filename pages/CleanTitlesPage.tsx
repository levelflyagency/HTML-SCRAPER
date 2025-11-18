
import React, { useState } from 'react';
import { Product } from '../types';
import { Copy, Eraser, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CleanTitlesPageProps {
  products: Product[];
  showToast: (msg: string) => void;
}

const CleanTitlesPage: React.FC<CleanTitlesPageProps> = ({ products, showToast }) => {
  const [originalCopyText, setOriginalCopyText] = useState('Copy All');
  const [cleanedCopyText, setCleanedCopyText] = useState('Copy All');

  // Apply the cleaning rules to the product titles
  const cleanedProducts: Product[] = products.map(product => {
    let cleanedTitle = product.title
      .replace(/•/g, '|')
      .replace(/【/g, '[')
      .replace(/】/g, '] ');

    cleanedTitle = cleanedTitle.replace(/[^a-zA-Z0-9\s|\[\]\-%+&.,:/]/g, '');
    cleanedTitle = cleanedTitle.replace(/\s\s+/g, ' ').trim();

    return {
      ...product,
      title: cleanedTitle,
    };
  });

  const handleCopy = (data: Product[], setText: React.Dispatch<React.SetStateAction<string>>) => {
    if (data.length === 0) return;

    const header = "Title\tPlatform\tPrice\n";
    const tsvContent = data
      .map(p => `${p.title.replace(/\s+/g, ' ')}\t${p.platform || ''}\t${p.price.toFixed(2)}`)
      .join('\n');
    
    navigator.clipboard.writeText(header + tsvContent).then(() => {
      showToast('Table data copied!');
    });
  };

  if (products.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-[500px] text-center border border-dashed border-slate-700 bg-slate-900/30 rounded-xl">
        <Eraser className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">No Data to Clean</h2>
        <p className="text-slate-500">Go back to a Scraper step and extract some data first.</p>
      </div>
    );
  }

  const ListHeader: React.FC = () => (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#0B1120]">
        <div className="col-span-8">Product Title</div>
        <div className="col-span-2 text-center">Platform</div>
        <div className="col-span-2 text-right">Price</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        
        {/* Original Titles Panel */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col space-y-4 h-full"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-400">Original ({products.length})</h3>
            <button
              onClick={() => handleCopy(products, setOriginalCopyText)}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" /> {originalCopyText}
            </button>
          </div>
          
          <div className="flex-grow bg-glass-bg border border-glass-border rounded-xl overflow-hidden flex flex-col">
            <ListHeader />
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {products.map((product, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center px-4 py-3 text-sm border-b border-white/5 text-slate-500">
                    <div className="col-span-8 truncate">{product.title}</div>
                    <div className="col-span-2 text-center text-[10px]">{product.platform}</div>
                    <div className="col-span-2 text-right font-mono opacity-50">{product.price.toFixed(2)}</div>
                  </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Arrow separator (Desktop) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 border border-neon-cyan/30 rounded-full p-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
             <ArrowRight className="w-6 h-6 text-neon-cyan" />
        </div>

        {/* Cleaned Titles Panel */}
        <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="flex flex-col space-y-4 h-full"
        >
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold text-neon-cyan">Regex Cleaned ({cleanedProducts.length})</h3>
             <button
              onClick={() => handleCopy(cleanedProducts, setCleanedCopyText)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 rounded-md border border-neon-cyan/20 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> {cleanedCopyText}
            </button>
           </div>

           <div className="flex-grow bg-glass-bg border border-glass-border rounded-xl overflow-hidden flex flex-col shadow-xl shadow-cyan-900/5">
              <ListHeader />
              <div className="overflow-y-auto flex-grow custom-scrollbar divide-y divide-white/5">
                {cleanedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 text-sm hover:bg-white/5 transition-colors even:bg-white/[0.02]"
                  >
                    <div className="col-span-8 truncate text-slate-200 font-medium">
                      {product.title}
                    </div>
                     <div className="col-span-2 text-center">
                       <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">{product.platform || '-'}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-neon-cyan">
                      {product.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CleanTitlesPage;
