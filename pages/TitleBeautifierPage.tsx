
import React, { useState, useRef } from 'react';
import { rewriteTitlesWithGemini } from '../services/geminiService';

const TitleBeautifierPage: React.FC = () => {
  const [inputTitles, setInputTitles] = useState<string>('');
  const [outputTitles, setOutputTitles] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy Results');
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

    // Simulate progress since we don't have real-time stream for this specific batch call
    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Hold at 90% until complete
        // Fast at first, then slower
        const increment = prev < 60 ? 5 : 2;
        return prev + increment;
      });
    }, 200);

    try {
      const titlesArray = inputTitles.split('\n');
      const rewritten = await rewriteTitlesWithGemini(titlesArray);
      setOutputTitles(rewritten.join('\n'));
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setProgress(0);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsLoading(false);
      // Reset progress after a short delay so user sees the full bar
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const handleCopy = () => {
    if (!outputTitles) return;
    navigator.clipboard.writeText(outputTitles).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Results'), 2000);
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
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Offer Title Beautifier</h2>
          <p className="text-sm text-gray-400">
            Rewrites titles into the "Hero-First" sales format: <span className="font-mono text-xs text-primary">[Full Access] ✅ [HERO] + [COUNT] ✨ [SKINS]...</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        {/* Input Panel */}
        <div className="flex flex-col space-y-4 h-full">
          <div className="flex justify-between items-end">
            <label className="text-lg font-semibold text-gray-200">Raw Titles (One per line)</label>
            <button 
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Clear All
            </button>
          </div>
          <textarea
            value={inputTitles}
            onChange={(e) => setInputTitles(e.target.value)}
            placeholder="e.g. pc ps4 xbox travis scott skin account 100 skins guaranteed full access instant"
            className="w-full flex-grow min-h-[400px] p-4 bg-base-200 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 resize-none font-mono text-sm"
          />
          
          <div className="space-y-2">
            <button
                onClick={handleBeautify}
                disabled={isLoading || !inputTitles.trim()}
                className="w-full py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
            >
                {isLoading ? (
                <div className="flex items-center justify-center z-10 relative">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing... {Math.floor(progress)}%
                </div>
                ) : (
                <span className="z-10 relative">✨ Transform Titles</span>
                )}
            </button>
            
            {/* Progress Line */}
            <div className="h-1 w-full bg-base-300 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-300 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-secondary'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-4 h-full">
          <div className="flex justify-between items-center h-[28px]">
            <label className="text-lg font-semibold text-green-400">Optimized Sales Offers</label>
            {outputTitles && (
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1 rounded bg-base-300 hover:bg-base-200 text-white transition-colors"
              >
                {copyButtonText}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={outputTitles}
            placeholder="Optimized titles will appear here..."
            className="w-full flex-grow min-h-[400px] p-4 bg-base-300/50 border-2 border-secondary/30 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all duration-300 resize-none font-mono text-sm text-green-50"
          />
          <div className="h-[52px] flex items-center justify-center text-gray-500 text-xs italic">
             Generated by Gemini 2.5 Flash
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBeautifierPage;
