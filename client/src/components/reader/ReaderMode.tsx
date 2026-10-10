import React, { useState, useEffect } from 'react';
import { X, VolumeX, Pause, Play, AArrowUp, AArrowDown, CheckCircle2, ExternalLink } from 'lucide-react';
import { useFactCheck, type Article } from '@/services/api';
import { usePreferencesStore, type ReaderTheme } from '@/store/usePreferencesStore';

interface ReaderModeProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReaderMode: React.FC<ReaderModeProps> = ({ article, isOpen, onClose }) => {
  const { fontSize, setFontSize, readerTheme, setReaderTheme } = usePreferencesStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { data: factCheckData, isLoading: isFactChecking } = useFactCheck(article?.title);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen || !article) return null;

  const handlePlayTTS = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${article.title}. ${article.content || article.description || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseTTS = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStopTTS = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const themes: Record<ReaderTheme, string> = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#e2d5ba]',
    dark: 'bg-slate-950 text-slate-100 border-slate-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-3xl h-full flex flex-col border-l shadow-2xl transition-all duration-300 ${themes[readerTheme]}`}>
        <div className="p-4 border-b flex items-center justify-between gap-4 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Decrease Font Size"
            >
              <AArrowDown className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Increase Font Size"
            >
              <AArrowUp className="w-4 h-4" />
            </button>

            <div className="ml-4 flex items-center gap-1 border-l pl-3 border-current/20">
              <button
                onClick={() => setReaderTheme('light')}
                className={`w-5 h-5 rounded-full bg-white border border-slate-300 shadow-sm ${readerTheme === 'light' ? 'ring-2 ring-blue-500' : ''}`}
                title="Light Theme"
              />
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`w-5 h-5 rounded-full bg-[#fbf0d9] border border-[#e2d5ba] shadow-sm ${readerTheme === 'sepia' ? 'ring-2 ring-amber-600' : ''}`}
                title="Sepia Theme"
              />
              <button
                onClick={() => setReaderTheme('dark')}
                className={`w-5 h-5 rounded-full bg-slate-950 border border-slate-700 shadow-sm ${readerTheme === 'dark' ? 'ring-2 ring-blue-400' : ''}`}
                title="Dark Theme"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={handlePauseTTS}
                className="p-2 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                title="Pause Read Aloud"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePlayTTS}
                className="p-2 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                title="Read Aloud (TTS)"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button
                onClick={handleStopTTS}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Stop Read Aloud"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                handleStopTTS();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
          <div className="space-y-3 border-b border-current/10 pb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">
              {article.sourceName} • {article.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {article.title}
            </h1>
          </div>

          {article.imageUrl && (
            <div className="rounded-2xl overflow-hidden shadow-md max-h-80 w-full">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="prose dark:prose-invert max-w-none leading-relaxed space-y-4"
            style={{ fontSize: `${fontSize}px` }}
          >
            <p className="font-medium opacity-90">{article.description}</p>
            {article.content && (
              <div className="mt-4 pt-4 border-t border-current/10 whitespace-pre-line">
                {article.content}
              </div>
            )}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm">Google Fact-Check Verifications</h3>
            </div>

            {isFactChecking ? (
              <p className="text-xs opacity-70">Searching fact check database...</p>
            ) : factCheckData?.claims && factCheckData.claims.length > 0 ? (
              <div className="space-y-3 pt-2">
                {factCheckData.claims.slice(0, 2).map((claim, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-current/10 text-xs space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">"{claim.text}"</p>
                    {claim.claimReview?.[0] && (
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Rating: {claim.claimReview[0].reviewRating?.textualRating || 'Verified'} ({claim.claimReview[0].publisher?.name})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs opacity-70">No direct fact-check claims flagged for this headline.</p>
            )}
          </div>

          <div className="pt-6 border-t border-current/10 flex justify-between items-center text-xs opacity-80">
            <span>Published on {new Date(article.publishedAt).toLocaleDateString()}</span>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Original Article <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
