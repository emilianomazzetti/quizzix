import React, { useState, useMemo } from 'react';
import { FillBlanksContent, BlankItem } from '../../types/quiz';
import { CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';

interface FillBlanksPlayerProps {
  content: FillBlanksContent;
  imageUrl?: string;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const FillBlanksPlayer: React.FC<FillBlanksPlayerProps> = ({
  content,
  imageUrl,
  onAnswer,
  disabled = false
}) => {
  // Normalize blanks: support either content.blanks array, object map, or single blankWord
  const blanksList: BlankItem[] = useMemo(() => {
    let list: BlankItem[] = [];
    if (Array.isArray(content.blanks) && content.blanks.length > 0) {
      list = content.blanks.filter((b) => b && b.correctWord);
    } else if (content.blanks && typeof content.blanks === 'object') {
      const vals = Object.values(content.blanks) as BlankItem[];
      list = vals.filter((b) => b && b.correctWord);
    }
    if (list.length > 0) return list;

    const singleWord = content.blankWord || '';
    return [
      {
        id: 'blank-1',
        correctWord: singleWord,
        distractors: content.distractors || ['OPZIONE 1', 'OPZIONE 2', 'OPZIONE 3']
      }
    ];
  }, [content.blankWord, content.distractors, content.blanks]);

  // Selected word for each blank id
  const [selectedWords, setSelectedWords] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Pre-generate deterministic shuffled choices for each blank
  const blankOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    blanksList.forEach((b) => {
      const allChoices = Array.from(
        new Set([b.correctWord.trim().toUpperCase(), ...(b.distractors || []).map((d) => d.trim().toUpperCase())])
      );
      // Deterministic sort based on character codes to avoid jitter on re-render
      map[b.id] = [...allChoices].sort((a, b) => a.localeCompare(b));
    });
    return map;
  }, [blanksList]);

  const handleSelectChange = (blankId: string, val: string) => {
    if (disabled || submitted) return;
    setSelectedWords((prev) => ({
      ...prev,
      [blankId]: val
    }));
  };

  const filledCount = blanksList.filter(
    (b) => selectedWords[b.id] && selectedWords[b.id].trim() !== ''
  ).length;

  const isComplete = blanksList.length > 0 && filledCount === blanksList.length;

  const handleConfirm = () => {
    if (disabled || submitted || !isComplete) return;
    setSubmitted(true);

    const isAllCorrect = blanksList.every((b) => {
      const chosen = (selectedWords[b.id] || '').trim().toUpperCase();
      const expected = b.correctWord.trim().toUpperCase();
      return chosen === expected;
    });

    onAnswer(isAllCorrect, {
      selectedWords,
      blanksList,
      userAnswers: blanksList.map((b) => selectedWords[b.id] || ''),
      summary: blanksList.map((b) => `${selectedWords[b.id] || '---'}`).join(', ')
    });
  };

  // Render text with inline vertical dropdown menus for blanks
  const renderSentenceWithDropdowns = () => {
    const rawTokens = (content.originalText || '').split(' ');
    // Clone blanks to track matched items across the sentence tokens
    const availableBlanks = [...blanksList];
    let matchedBlankNumber = 0;

    return (
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-lg md:text-xl font-semibold text-slate-100 leading-relaxed">
        {rawTokens.map((token, idx) => {
          const cleanToken = token.replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ]/g, '').toUpperCase();
          const matchedBlankIndex = availableBlanks.findIndex(
            (b) => b && b.correctWord.trim().toUpperCase() === cleanToken
          );

          if (matchedBlankIndex !== -1) {
            const targetBlank = availableBlanks[matchedBlankIndex];
            // Consume this blank so subsequent duplicate words can match next blank
            availableBlanks[matchedBlankIndex] = null as any;
            matchedBlankNumber++;

            const blankId = targetBlank.id;
            const chosenVal = selectedWords[blankId] || '';
            const options = blankOptionsMap[blankId] || [targetBlank.correctWord];
            const trailingPunctuation = token.match(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ]+$/)?.[0] || '';

            return (
              <span key={`token-${idx}-${blankId}`} className="inline-flex items-center mx-1 my-1">
                <div className="relative inline-block">
                  <select
                    disabled={disabled || submitted}
                    value={chosenVal}
                    onChange={(e) => handleSelectChange(blankId, e.target.value)}
                    className={`appearance-none font-bold text-sm md:text-base py-2.5 pl-3.5 pr-9 rounded-xl border-2 shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 ${
                      chosenVal
                        ? 'bg-amber-400 text-slate-950 border-amber-300 ring-amber-400/50 font-black'
                        : 'bg-slate-900 text-amber-300 border-amber-400/80 hover:border-amber-300'
                    }`}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">
                      ▼ Scegli parola ({matchedBlankNumber})
                    </option>
                    {options.map((opt, optIdx) => (
                      <option
                        key={optIdx}
                        value={opt}
                        className="bg-slate-900 text-white font-bold py-1.5"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    chosenVal ? 'text-slate-950' : 'text-amber-400'
                  }`} />
                </div>
                {trailingPunctuation && <span className="text-slate-200 ml-0.5">{trailingPunctuation}</span>}
              </span>
            );
          }

          return (
            <span key={`token-${idx}`} className="text-slate-200">
              {token}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {imageUrl && (
        <div className="w-full max-h-60 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
          <img src={imageUrl} alt="Supporto visivo" className="max-h-60 w-auto object-contain" />
        </div>
      )}

      {/* Main Sentence Card with Vertical Dropdown Menus */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-800/95 border-2 border-indigo-500/50 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Testo a buchi • Seleziona dai menu a discesa
          </span>
          <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/30">
            {filledCount} di {blanksList.length} completati
          </span>
        </div>

        <div className="py-2">
          {renderSentenceWithDropdowns()}
        </div>
      </div>

      {/* Confirmation Submit Button */}
      <button
        type="button"
        disabled={disabled || submitted || !isComplete}
        onClick={handleConfirm}
        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${
          isComplete && !submitted && !disabled
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white cursor-pointer active:scale-98 ring-2 ring-emerald-400/50 animate-pulse'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
        }`}
      >
        <CheckCircle2 className="w-6 h-6" />
        {submitted
          ? 'Risposte Inviate!'
          : isComplete
          ? 'Conferma Tutte le Parole 🚀'
          : `Completa tutti i menu a discesa (${filledCount}/${blanksList.length})`}
      </button>
    </div>
  );
};
