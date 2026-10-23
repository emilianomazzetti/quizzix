import React, { useState } from 'react';
import { TrueFalseContent } from '../../types/quiz';
import { Check, X } from 'lucide-react';

interface TrueFalsePlayerProps {
  content: TrueFalseContent;
  imageUrl?: string;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const TrueFalsePlayer: React.FC<TrueFalsePlayerProps> = ({
  content,
  imageUrl,
  onAnswer,
  disabled = false
}) => {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (val: boolean) => {
    if (disabled || selected !== null) return;
    setSelected(val);
    const isCorrect = val === content.isTrueCorrect;
    onAnswer(isCorrect, { selected: val });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {imageUrl && (
        <div className="w-full max-h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
          <img src={imageUrl} alt="Immagine di supporto" className="max-h-64 w-auto object-contain" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <button
          disabled={disabled || selected !== null}
          onClick={() => handleSelect(true)}
          className={`h-40 rounded-3xl font-black text-2xl md:text-3xl flex flex-col items-center justify-center gap-3 transition-all transform shadow-2xl ${
            selected === true
              ? 'ring-4 ring-white bg-emerald-500 scale-105'
              : selected !== null
              ? 'opacity-30 bg-slate-800'
              : 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-white'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span>VERO</span>
        </button>

        <button
          disabled={disabled || selected !== null}
          onClick={() => handleSelect(false)}
          className={`h-40 rounded-3xl font-black text-2xl md:text-3xl flex flex-col items-center justify-center gap-3 transition-all transform shadow-2xl ${
            selected === false
              ? 'ring-4 ring-white bg-rose-500 scale-105'
              : selected !== null
              ? 'opacity-30 bg-slate-800'
              : 'bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 active:scale-95 text-white'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <X className="w-8 h-8 stroke-[3]" />
          </div>
          <span>FALSO</span>
        </button>
      </div>
    </div>
  );
};
