
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Wand2, Eraser, FileCode, BrainCircuit } from 'lucide-react';

import ScraperPage from './pages/ScraperPage';
import CleanTitlesPage from './pages/CleanTitlesPage';
import TitleBeautifierPage from './pages/TitleBeautifierPage';
import ScraperPageV2 from './pages/ScraperPageV2';
import { Product } from './types';

type Page = 'scraper' | 'scraper-v2' | 'cleaner' | 'beautifier';

const initialHtml = `<html class="dark" lang="en"><head>
<!-- Default placeholder content preserved -->
<style>body {transition: opacity ease-in 0.2s; } body[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } </style>
</head><body><div class="placeholder">Paste your HTML here...</div></body></html>`;

// -- Toast Component --
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-slate-900 border border-neon-cyan/30 text-white rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)]"
    >
      <CheckCircle2 className="w-5 h-5 text-neon-cyan" />
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('scraper');
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml.trim());
  const [scrapedData, setScrapedData] = useState<Product[]>([]);
  const [removedDuplicates, setRemovedDuplicates] = useState<Product[]>([]);
  const [filteredOutProducts, setFilteredOutProducts] = useState<Product[]>([]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const steps = [
    { id: 'scraper', label: 'Scrape (DOM)', icon: FileCode },
    { id: 'scraper-v2', label: 'Scrape (AI)', icon: BrainCircuit },
    { id: 'cleaner', label: 'Clean', icon: Eraser },
    { id: 'beautifier', label: 'Beautify', icon: Wand2 },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050b1a] to-black text-slate-200 font-sans selection:bg-neon-cyan/30 selection:text-cyan-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Header */}
        <header className="text-center mb-12 space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 tracking-tight"
          >
            HTML OPTIMIZER
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-slate-400 font-light text-lg"
          >
            Scrape. Clean. <span className="text-neon-cyan font-medium">Dominate.</span>
          </motion.p>
        </header>

        {/* Stepper Navigation */}
        <nav className="mb-12">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 transform -translate-y-1/2" />

            {steps.map((step, index) => {
              const isActive = page === step.id;
              const Icon = step.icon;
              
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setPage(step.id as Page)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-full border backdrop-blur-md transition-all duration-300 ${
                    isActive 
                      ? 'bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="font-semibold text-sm tracking-wide">{step.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 rounded-full bg-neon-cyan/5 blur-md -z-10"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
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
                  showToast={showToast}
                />
              )}
              {page === 'scraper-v2' && (
                <ScraperPageV2
                  htmlContent={htmlContent}
                  setHtmlContent={setHtmlContent}
                  scrapedData={scrapedData}
                  setScrapedData={setScrapedData}
                  setRemovedDuplicates={setRemovedDuplicates}
                  setFilteredOutProducts={setFilteredOutProducts}
                  showToast={showToast}
                />
              )}
              {page === 'cleaner' && (
                  <CleanTitlesPage products={scrapedData} showToast={showToast} />
              )}
              {page === 'beautifier' && (
                  <TitleBeautifierPage showToast={showToast} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
