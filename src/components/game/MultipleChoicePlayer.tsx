import React, { useState } from 'react';
import { MultipleChoiceContent } from '../../types/quiz';
import { CheckCircle2, Circle } from 'lucide-react';

interface MultipleChoicePlayerProps {
  content: MultipleChoiceContent;
  imageUrl?: string;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

const OPTION_COLORS = [
  'from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700',
  'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
  'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
  'from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
  'from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700',
];

const OPTION_SHAPES = ['▲', '◆', '●', '■', '★', '⬟'];

export const MultipleChoicePlayer: React.FC<MultipleChoicePlayerProps> = ({
  content,
  imageUrl,
  onAnswer,
  disabled = false
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (disabled || selectedId) return;
    setSelectedId(option.id);
    onAnswer(option.isCorrect, { selectedId: option.id, text: option.text });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {imageUrl && (
        <div className="w-full max-h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
          <img src={imageUrl} alt="Immagine di supporto" className="max-h-64 w-auto object-contain" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.options.map((opt, index) => {
          const isSelected = selectedId === opt.id;
          const bgGrad = OPTION_COLORS[index % OPTION_COLORS.length];
          const shape = OPTION_SHAPES[index % OPTION_SHAPES.length];

          return (
            <button
              key={opt.id}
              disabled={disabled || selectedId !== null}
              onClick={() => handleSelect(opt)}
              className={`p-6 rounded-2xl font-bold text-left transition-all transform duration-150 flex items-center justify-between text-white shadow-xl ${
                isSelected
                  ? 'ring-4 ring-white scale-102 bg-gradient-to-r from-emerald-500 to-teal-600'
                  : selectedId !== null
                  ? 'opacity-40 grayscale-[30%] bg-slate-800'
                  : `bg-gradient-to-r ${bgGrad} active:scale-98 hover:shadow-2xl`
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-black/20 flex-shrink-0 flex items-center justify-center text-xl font-black">
                  {shape}
                </span>
                {opt.imageUrl && (
                  <img
                    src={opt.imageUrl}
                    alt={opt.text}
                    className="w-16 h-16 object-cover rounded-xl border border-white/30 flex-shrink-0 shadow-md bg-black/20"
                  />
                )}
                <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide break-words">{opt.text}</span>
              </div>
              <div className="flex-shrink-0 ml-3">
                {isSelected ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : (
                  <Circle className="w-6 h-6 text-white/40" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
