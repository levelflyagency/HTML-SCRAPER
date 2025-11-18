
import React, { useState, useRef } from 'react';
import { optimizeTitle } from '../utils/titleOptimizer';
import { Wand2, Copy, ArrowRight, Zap, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TitleBeautifierPageProps {
    showToast: (msg: string) => void;
}

const TitleBeautifierPage: React.FC<TitleBeautifierPageProps> = ({ showToast }) => {
  const [inputTitles, setInputTitles] = useState<string>('');
  const [outputTitles, setOutputTitles] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const handleBeautify = async () => {
    if (!inputTitles.trim()) {
      setError("Please enter some titles to beautify.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputTitles('');
    setProgress(0);

    // Simulate processing time for better UX
    const totalDuration = 600; 
    const intervalTime = 30;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    timerRef.current = window.setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 95);
      setProgress(newProgress);
    }, intervalTime);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const titlesArray = inputTitles.split('\n').filter(t => t.trim().length > 0);
      const processedTitles = titlesArray.map(title => optimizeTitle(title));
      
      setOutputTitles(processedTitles.join('\n'));
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setProgress(0);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleCopy = () => {
    if (!outputTitles) return;
    navigator.clipboard.writeText(outputTitles).then(() => {
      showToast("Optimized titles copied successfully!");
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  const handleClear = () => {
    setInputTitles('');
    setOutputTitles('');
    setError(null);
    setProgress(0);
  };

  return (
    <div className="h-full flex flex-col">
      
      <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-lg shadow-orange-900/20">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Universal Optimizer</h2>
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Supports Valorant • CS2 • Fortnite • LoL • Genshin</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        {/* Input Panel */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-4 h-full"
        >
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Raw Input (Any Game)</label>
            <button 
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-white underline"
            >
              Clear
            </button>
          </div>
          
          <div className="relative flex-grow bg-[#0B1120] border border-glass-border rounded-xl overflow-hidden shadow-inner group focus-within:border-amber-500/50 transition-colors">
             <textarea
                value={inputTitles}
                onChange={(e) => setInputTitles(e.target.value)}
                placeholder={`Paste messy titles here... Examples:\n\nValorant: "NA Radiant Rank Reaver Vandal 100 skins"\nCS2: "Global Elite Dragon Lore 5000 hours full access"\nFortnite: "Black Knight 200 skins travis scott fa"`}
                className="w-full h-full p-5 bg-transparent text-slate-300 font-mono text-sm outline-none resize-none leading-relaxed placeholder:text-slate-700"
            />
          </div>
          
          <div className="space-y-3">
            <button
                onClick={handleBeautify}
                disabled={isLoading || !inputTitles.trim()}
                className="w-full py-4 relative group overflow-hidden border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 z-10 relative">
                        <span className="text-white/80 font-mono">PROCESSING... {Math.floor(progress)}%</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 z-10 relative">
                        <Wand2 className="w-5 h-5" />
                        <span>BEAUTIFY TITLES</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            </button>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full transition-all duration-300 ease-out shadow-[0_0_10px_#fbbf24] ${progress === 100 ? 'bg-green-500 shadow-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
          </div>

          {error && <p className="text-rose-400 text-sm text-center bg-rose-900/20 py-2 rounded border border-rose-500/20">{error}</p>}
        </motion.div>

        {/* Output Panel */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col space-y-4 h-full"
        >
          <div className="flex justify-between items-center h-[20px]">
            <label className="text-sm font-semibold text-green-400 uppercase tracking-wide flex items-center gap-2">
                 <ArrowRight className="w-4 h-4" /> Optimized Output
            </label>
            {outputTitles && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            )}
          </div>

          <div className="relative flex-grow bg-[#0B1120] border border-green-500/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.05)]">
             {progress === 100 && (
                 <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: [0, 0.2, 0] }} 
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-green-500 pointer-events-none"
                 />
             )}
             
             <textarea
                readOnly
                value={outputTitles}
                placeholder="Optimized results will appear here..."
                className="w-full h-full p-5 bg-transparent font-mono text-sm outline-none resize-none text-green-50 placeholder:text-slate-800 leading-relaxed selection:bg-green-500/30"
            />
          </div>
          
          <div className="h-[52px] flex items-center justify-center text-slate-600 text-xs gap-4">
             <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Auto-Rank Detection</div>
             <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Rare Skin Priority</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TitleBeautifierPage;
