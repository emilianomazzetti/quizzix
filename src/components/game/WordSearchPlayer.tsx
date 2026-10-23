import React, { useState, useMemo } from 'react';
import { WordSearchContent } from '../../types/quiz';
import { Check, CheckCircle2 } from 'lucide-react';
import { generateWordSearchGrid } from '../../utils/wordSearchGenerator';

interface WordSearchPlayerProps {
  content: WordSearchContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const WordSearchPlayer: React.FC<WordSearchPlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const gridSize = content.gridSize || 8;
  const wordsKey = (content.words || []).join(',');

  const { matrix: grid, wordsToFind } = useMemo(
    () => generateWordSearchGrid(content.words || [], gridSize),
    [wordsKey, gridSize]
  );

  const [selectedCoords, setSelectedCoords] = useState<{ r: number; c: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCoords, setFoundCoords] = useState<{ r: number; c: number; word: string }[]>([]);

  const toggleSelect = (r: number, c: number) => {
    if (disabled) return;
    const exists = selectedCoords.some((coord) => coord.r === r && coord.c === c);
    let newCoords: { r: number; c: number }[] = [];

    if (exists) {
      newCoords = selectedCoords.filter((coord) => !(coord.r === r && coord.c === c));
    } else {
      newCoords = [...selectedCoords, { r, c }];
    }
    setSelectedCoords(newCoords);

    // Check if the current selection forms one of the words to find
    const wordFormed = newCoords.map((coord) => grid[coord.r][coord.c]).join('');
    const revFormed = wordFormed.split('').reverse().join('');

    const matchedWord = wordsToFind.find(
      (w) => !foundWords.includes(w) && (w === wordFormed || w === revFormed)
    );

    if (matchedWord) {
      const nextFound = [...foundWords, matchedWord];
      setFoundWords(nextFound);
      setFoundCoords((prev) => [
        ...prev,
        ...newCoords.map((coord) => ({ ...coord, word: matchedWord }))
      ]);
      setSelectedCoords([]);

      // Inform parent about each word found immediately, with partial points!
      onAnswer(nextFound.length === wordsToFind.length, {
        foundWords: nextFound,
        totalWords: wordsToFind.length,
        count: nextFound.length,
        foundAll: nextFound.length === wordsToFind.length
      });
    }
  };

  const isCoordFound = (r: number, c: number) => {
    return foundCoords.some((fc) => fc.r === r && fc.c === c);
  };

  const isCoordSelected = (r: number, c: number) => {
    return selectedCoords.some((sc) => sc.r === r && sc.c === c);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
          Trova le parole nascoste toccando le lettere in sequenza (Ricevi punti per ogni parola trovata!)
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        {/* Letter Grid */}
        <div
          className="grid gap-1.5 p-3 bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl select-none"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, r) =>
            row.map((char, c) => {
              const found = isCoordFound(r, c);
              const selected = isCoordSelected(r, c);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={disabled || found}
                  onClick={() => toggleSelect(r, c)}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded-xl font-black text-sm md:text-base flex items-center justify-center transition-all ${
                    found
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-black'
                      : selected
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {char}
                </button>
              );
            })
          )}
        </div>

        {/* Word Targets List */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 w-full md:w-56 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Parole da trovare:
          </h4>
          <div className="flex flex-col gap-2">
            {wordsToFind.map((word) => {
              const isFound = foundWords.includes(word);
              return (
                <div
                  key={word}
                  className={`px-3 py-2 rounded-xl text-sm font-black flex items-center justify-between transition-all ${
                    isFound
                      ? 'bg-emerald-500/20 text-emerald-300 line-through border border-emerald-500/40'
                      : 'bg-slate-900/60 text-white border border-slate-800'
                  }`}
                >
                  <span>{word}</span>
                  {isFound && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-400 mt-2 font-bold">
            Trovate: <span className="text-emerald-400 font-black">{foundWords.length}</span> su {wordsToFind.length}
          </div>
        </div>
      </div>
    </div>
  );
};
