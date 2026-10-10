import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2, HelpCircle } from 'lucide-react';
import type { Article } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface AISummaryModalProps {
  article: Article | null;
  isOpen: boolean;
  isLoading: boolean;
  summary?: {
    bullets?: string[];
    eli5?: string;
  } | null;
  onClose: () => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  article,
  isOpen,
  isLoading,
  summary,
  onClose,
}) => {
  const [tab, setTab] = useState<'BULLETS' | 'ELI5'>('BULLETS');

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">AI Brief & Insight</h2>
              <p className="text-xs text-slate-500 line-clamp-1">{article.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4 flex gap-2">
          <Button
            variant={tab === 'BULLETS' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab('BULLETS')}
            className="text-xs gap-1.5 flex-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            3 Key Takeaways
          </Button>
          <Button
            variant={tab === 'ELI5' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab('ELI5')}
            className="text-xs gap-1.5 flex-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            ELI5 Summary
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Gemini 1.5 Flash is generating key insights...</p>
            </div>
          ) : summary ? (
            tab === 'BULLETS' ? (
              <ul className="space-y-3">
                {summary.bullets?.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
                  In simple terms (ELI5):
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{summary.eli5 || 'No ELI5 summary available.'}"
                </p>
              </div>
            )
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">
              Unable to generate summary at this time.
            </p>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
