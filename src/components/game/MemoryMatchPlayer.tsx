import React, { useState, useMemo } from 'react';
import { MemoryMatchContent, AssociationCell } from '../../types/quiz';
import { Check, Sparkles } from 'lucide-react';

interface MemoryMatchPlayerProps {
  content: MemoryMatchContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

const MATCH_COLORS = [
  'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400',
  'border-sky-400 bg-sky-500/20 text-sky-300 ring-2 ring-sky-400',
  'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400',
  'border-purple-400 bg-purple-500/20 text-purple-300 ring-2 ring-purple-400',
  'border-rose-400 bg-rose-500/20 text-rose-300 ring-2 ring-rose-400',
  'border-teal-400 bg-teal-500/20 text-teal-300 ring-2 ring-teal-400',
];

export const MemoryMatchPlayer: React.FC<MemoryMatchPlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const [selectedColAId, setSelectedColAId] = useState<string | null>(null);
  const [selectedColBId, setSelectedColBId] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ idA: string; idB: string }[]>([]);

  const pairs = content.pairs || [];
  const pairsKey = pairs.map((p) => p.id).join('-');

  // Shuffle order of column A and column B deterministically once per pair set
  const shuffledColA = useMemo(() => {
    return [...pairs].sort((a, b) => {
      const labelA = a.itemA?.text || a.text || a.id;
      const labelB = b.itemA?.text || b.text || b.id;
      const codeA = (a.id.charCodeAt(0) * 19 + labelA.length * 7) % 31;
      const codeB = (b.id.charCodeAt(0) * 19 + labelB.length * 7) % 31;
      return codeA - codeB || a.id.localeCompare(b.id);
    });
  }, [pairsKey]);

  const shuffledColB = useMemo(() => {
    return [...pairs].sort((a, b) => {
      const labelA = a.itemB?.text || a.text || a.id;
      const labelB = b.itemB?.text || b.text || b.id;
      const codeA = (labelA.charCodeAt(0) * 23 + a.id.length * 11) % 31;
      const codeB = (labelB.charCodeAt(0) * 23 + b.id.length * 11) % 31;
      return codeA - codeB || a.id.localeCompare(b.id);
    });
  }, [pairsKey]);

  const handleColAClick = (id: string) => {
    if (disabled || matches.some((m) => m.idA === id)) return;
    setSelectedColAId(id);

    if (selectedColBId) {
      applyPair(id, selectedColBId);
    }
  };

  const handleColBClick = (id: string) => {
    if (disabled || matches.some((m) => m.idB === id)) return;
    setSelectedColBId(id);

    if (selectedColAId) {
      applyPair(selectedColAId, id);
    }
  };

  const applyPair = (idA: string, idB: string) => {
    const newMatches = [...matches, { idA, idB }];
    setMatches(newMatches);
    setSelectedColAId(null);
    setSelectedColBId(null);

    // If all pairs are matched, verify correctness!
    if (newMatches.length === pairs.length) {
      const allCorrect = newMatches.every((m) => m.idA === m.idB);
      onAnswer(allCorrect, { matches: newMatches });
    }
  };

  const getMatchIndex = (id: string, col: 'A' | 'B') => {
    return matches.findIndex((m) => (col === 'A' ? m.idA === id : m.idB === id));
  };

  const renderCellContent = (cell?: AssociationCell, defaultFallback?: { text?: string; image?: string }) => {
    const text = cell?.text || defaultFallback?.text;
    const image = cell?.image || defaultFallback?.image;
    const hasImage = Boolean(image);
    const hasText = Boolean(text && text.trim().length > 0);

    if (hasImage && hasText) {
      return (
        <div className="relative w-full h-full flex flex-col justify-end p-2 bg-slate-900 overflow-hidden">
          <img src={image} alt={text} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <span className="relative z-10 text-xs sm:text-sm font-black text-white text-center drop-shadow-md line-clamp-2">
            {text}
          </span>
        </div>
      );
    }

    if (hasImage) {
      return (
        <img
          src={image}
          alt="Immagine cella"
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <span className="p-3 text-sm sm:text-base font-bold text-center line-clamp-3 text-white">
        {text || 'Cella vuota'}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
          Tocca una cella della colonna A e la cella corrispondente nella colonna B
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Column A */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black text-slate-400 text-center uppercase tracking-wider">
            Colonna A ({shuffledColA.length} elementi)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {shuffledColA.map((pair) => {
              const matchIdx = getMatchIndex(pair.id, 'A');
              const isMatched = matchIdx !== -1;
              const isSelected = selectedColAId === pair.id;
              const fallback = { image: pair.image, text: undefined };

              return (
                <div
                  key={`colA-${pair.id}`}
                  onClick={() => handleColAClick(pair.id)}
                  className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 aspect-video flex items-center justify-center bg-slate-800 shadow-md ${
                    isMatched
                      ? MATCH_COLORS[matchIdx % MATCH_COLORS.length]
                      : isSelected
                      ? 'border-indigo-400 ring-4 ring-indigo-500/50 scale-103 bg-indigo-900/60'
                      : 'border-slate-700 hover:border-slate-500 hover:scale-102 hover:bg-slate-750'
                  }`}
                >
                  {renderCellContent(pair.itemA, fallback)}
                  {isMatched && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column B */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black text-slate-400 text-center uppercase tracking-wider">
            Colonna B ({shuffledColB.length} elementi)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {shuffledColB.map((pair) => {
              const matchIdx = getMatchIndex(pair.id, 'B');
              const isMatched = matchIdx !== -1;
              const isSelected = selectedColBId === pair.id;
              const fallback = { text: pair.text, image: undefined };

              return (
                <button
                  type="button"
                  key={`colB-${pair.id}`}
                  disabled={disabled || isMatched}
                  onClick={() => handleColBClick(pair.id)}
                  className={`group relative rounded-2xl overflow-hidden border-2 text-center transition-all aspect-video flex items-center justify-center shadow-md ${
                    isMatched
                      ? MATCH_COLORS[matchIdx % MATCH_COLORS.length]
                      : isSelected
                      ? 'border-indigo-400 ring-4 ring-indigo-500/50 scale-103 bg-indigo-900/60'
                      : 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-white hover:border-slate-500 hover:scale-102'
                  }`}
                >
                  {renderCellContent(pair.itemB, fallback)}
                  {isMatched && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-xs font-semibold text-slate-400">
        Associazioni completate: <strong className="text-indigo-300">{matches.length}</strong> di{' '}
        <strong className="text-indigo-300">{pairs.length}</strong>
      </div>
    </div>
  );
};
