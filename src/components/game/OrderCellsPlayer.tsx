import React, { useState, useEffect } from 'react';
import { OrderCellsContent } from '../../types/quiz';
import { ArrowUp, ArrowDown, CheckCircle2, GripVertical } from 'lucide-react';

interface OrderCellsPlayerProps {
  content: OrderCellsContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const OrderCellsPlayer: React.FC<OrderCellsPlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const [items, setItems] = useState<{ id: string; text: string; image?: string }[]>(() => {
    return [...content.correctOrder].sort((a, b) => {
      const codeA = (a.id.charCodeAt(0) * 13 + a.text.length * 7) % 29;
      const codeB = (b.id.charCodeAt(0) * 13 + b.text.length * 7) % 29;
      return codeA - codeB || a.id.localeCompare(b.id);
    });
  });
  const [submitted, setSubmitted] = useState(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (disabled || submitted) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleConfirm = () => {
    if (disabled || submitted) return;
    setSubmitted(true);

    const isCorrect = items.every((item, idx) => item.id === content.correctOrder[idx].id);
    onAnswer(isCorrect, { finalOrder: items.map((i) => i.id) });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
          Trascina o usa le frecce per posizionare le celle nell'ordine corretto
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 sm:p-4 bg-slate-800/90 border-2 border-slate-700 rounded-2xl shadow-lg transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-sm shrink-0">
                {index + 1}
              </div>

              {item.image && (
                <img
                  src={item.image}
                  alt={item.text}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-slate-600 shadow-md shrink-0 bg-slate-900"
                />
              )}

              <div className="flex-1 font-bold text-base sm:text-lg text-white">
                {item.text}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || submitted || index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white transition-colors"
                  title="Sposta su"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled || submitted || index === items.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white transition-colors"
                  title="Sposta giù"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || submitted}
        onClick={handleConfirm}
        className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-98"
      >
        <CheckCircle2 className="w-6 h-6" />
        {submitted ? 'Ordine Inviato' : 'Conferma Ordine'}
      </button>
    </div>
  );
};
