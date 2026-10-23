import React, { useState, useEffect } from 'react';
import { AnagramContent } from '../../types/quiz';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

interface AnagramPlayerProps {
  content: AnagramContent;
  imageUrl?: string;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const AnagramPlayer: React.FC<AnagramPlayerProps> = ({
  content,
  imageUrl,
  onAnswer,
  disabled = false
}) => {
  const targetChars = content.phraseOrWord.trim().toUpperCase().split('');
  const [bank, setBank] = useState<{ id: string; char: string }[]>([]);
  const [slots, setSlots] = useState<{ id: string; char: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Generate unique objects for each character and shuffle once per target word
    const letterItems = targetChars.map((c, idx) => ({ id: `char-${idx}-${c}`, char: c }));
    const shuffled = [...letterItems].sort((a, b) => {
      const codeA = (a.char.charCodeAt(0) * 17 + a.id.length * 31) % 97;
      const codeB = (b.char.charCodeAt(0) * 17 + b.id.length * 31) % 97;
      return codeA - codeB || a.id.localeCompare(b.id);
    });
    setBank(shuffled);
    setSlots([]);
  }, [content.phraseOrWord]);

  const selectTile = (item: { id: string; char: string }) => {
    if (disabled || submitted) return;
    setBank((prev) => prev.filter((t) => t.id !== item.id));
    setSlots((prev) => [...prev, item]);
  };

  const returnTile = (item: { id: string; char: string }) => {
    if (disabled || submitted) return;
    setSlots((prev) => prev.filter((t) => t.id !== item.id));
    setBank((prev) => [...prev, item]);
  };

  const handleReset = () => {
    if (disabled || submitted) return;
    setBank([...bank, ...slots]);
    setSlots([]);
  };

  const handleConfirm = () => {
    if (disabled || submitted || slots.length !== targetChars.length) return;
    setSubmitted(true);
    const formed = slots.map((s) => s.char).join('');
    const expected = targetChars.join('');
    const isCorrect = formed === expected;
    onAnswer(isCorrect, { formedWord: formed });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {imageUrl && (
        <div className="w-full max-h-56 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
          <img src={imageUrl} alt="Indizio anagramma" className="max-h-56 w-auto object-contain" />
        </div>
      )}

      <div className="text-center">
        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
          Tocca le lettere per ricomporre la parola segreta
        </p>
      </div>

      {/* Target Word Slots */}
      <div className="p-6 bg-slate-800/80 border-2 border-slate-700 rounded-3xl shadow-xl flex flex-col items-center gap-4">
        <div className="flex flex-wrap gap-2.5 justify-center min-h-[64px] items-center">
          {Array.from({ length: targetChars.length }).map((_, idx) => {
            const filled = slots[idx];
            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || submitted || !filled}
                onClick={() => filled && returnTile(filled)}
                className={`w-12 h-14 md:w-14 md:h-16 rounded-2xl font-black text-2xl flex items-center justify-center transition-all ${
                  filled
                    ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-lg ring-2 ring-indigo-400 scale-102 cursor-pointer'
                    : 'bg-slate-900/80 border-2 border-dashed border-slate-700 text-slate-600'
                }`}
              >
                {filled ? filled.char : ''}
              </button>
            );
          })}
        </div>

        {slots.length > 0 && !submitted && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Azzera lettere
          </button>
        )}
      </div>

      {/* Available Letters Bank */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
          Lettere disponibili:
        </span>
        <div className="flex flex-wrap gap-2.5 justify-center min-h-[60px] p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
          {bank.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled || submitted}
              onClick={() => selectTile(item)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl font-black text-xl md:text-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 shadow-md transition-all flex items-center justify-center cursor-pointer"
            >
              {item.char}
            </button>
          ))}
          {bank.length === 0 && (
            <span className="text-xs text-emerald-400 font-semibold self-center">
              Tutte le lettere inserite!
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || submitted || slots.length !== targetChars.length}
        onClick={handleConfirm}
        className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-98"
      >
        <CheckCircle2 className="w-6 h-6" />
        {submitted ? 'Parola Inviata' : 'Conferma Parola'}
      </button>
    </div>
  );
};
