import React, { useState } from 'react';
import { CellIdentifyContent } from '../../types/quiz';
import { Check, CheckCircle2 } from 'lucide-react';

interface CellIdentifyPlayerProps {
  content: CellIdentifyContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const CellIdentifyPlayer: React.FC<CellIdentifyPlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const [selectedCellIds, setSelectedCellIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Normalize cells safely whether array or Firebase object
  const cells = Array.isArray(content?.cells)
    ? content.cells
    : content?.cells && typeof content.cells === 'object'
    ? Object.values(content.cells)
    : [];

  const toggleCell = (id: string) => {
    if (disabled || submitted) return;
    setSelectedCellIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (disabled || submitted || selectedCellIds.length === 0) return;
    setSubmitted(true);

    // Valid if every correct cell is selected AND no incorrect cell is selected
    const correctIds = cells.filter((c: any) => c.isMatch).map((c: any) => c.id);
    const hasAllCorrect = correctIds.length > 0 && correctIds.every((id: string) => selectedCellIds.includes(id));
    const hasNoIncorrect = selectedCellIds.every((id: string) => correctIds.includes(id));
    const isCorrect = hasAllCorrect && hasNoIncorrect;

    const selectedTexts = cells
      .filter((c: any) => selectedCellIds.includes(c.id))
      .map((c: any) => c.text);

    onAnswer(isCorrect, { selectedCellIds, selectedTexts });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Stimulus Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-2 border-indigo-500/50 p-6 rounded-3xl text-center shadow-xl">
        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300">
          Trova tutti gli elementi collegati a:
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white mt-1 uppercase tracking-wider">
          {content?.stimulus || 'Elemento'}
        </h2>
        <p className="text-xs text-slate-300 mt-2">
          Clicca su tutte le celle corrette (anche più di una) e poi premi Conferma
        </p>
      </div>

      {/* Grid of Cells */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {cells.map((cell: any) => {
          const isSelected = selectedCellIds.includes(cell.id);

          return (
            <button
              key={cell.id}
              type="button"
              disabled={disabled || submitted}
              onClick={() => toggleCell(cell.id)}
              className={`p-4 rounded-2xl border-2 font-bold text-base md:text-lg transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] text-center shadow-lg relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/25 ring-4 ring-emerald-500/40 text-emerald-200 scale-102 font-black'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-white hover:border-slate-500'
              }`}
            >
              {cell.image && (
                <img
                  src={cell.image}
                  alt={cell.text}
                  className="w-16 h-16 object-cover rounded-xl"
                />
              )}
              <span>{cell.text}</span>

              {isSelected && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || submitted || selectedCellIds.length === 0}
        onClick={handleConfirm}
        className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-98"
      >
        <CheckCircle2 className="w-6 h-6" />
        {submitted ? 'Selezione Inviata' : `Conferma Selezione (${selectedCellIds.length})`}
      </button>
    </div>
  );
};
