import React, { useState, useMemo } from 'react';
import { PuzzleContent } from '../../types/quiz';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

interface PuzzlePlayerProps {
  content: PuzzleContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

interface TileItem {
  id: number;
  originalPos: number;
}

export const PuzzlePlayer: React.FC<PuzzlePlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const size = content.gridSize || 2; // 2x2 or 3x3
  const totalTiles = size * size;

  const initialBank = useMemo(() => {
    const list: TileItem[] = Array.from({ length: totalTiles }, (_, i) => ({
      id: i,
      originalPos: i
    }));
    // Stable pseudo-shuffle based on tile index so all clients have identical initial order
    return [...list].sort((a, b) => {
      const codeA = (a.id * 17 + size * 13) % totalTiles;
      const codeB = (b.id * 17 + size * 13) % totalTiles;
      return codeA - codeB || a.id - b.id;
    });
  }, [totalTiles, size]);

  const [bank, setBank] = useState<TileItem[]>(initialBank);
  const [placedSlots, setPlacedSlots] = useState<(TileItem | null)[]>(
    () => Array(totalTiles).fill(null)
  );
  const [selectedBankTile, setSelectedBankTile] = useState<TileItem | null>(null);
  const [draggedTile, setDraggedTile] = useState<TileItem | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const getTileStyle = (originalPos: number): React.CSSProperties => {
    const row = Math.floor(originalPos / size);
    const col = originalPos % size;
    const xPercent = (col / (size - 1 || 1)) * 100;
    const yPercent = (row / (size - 1 || 1)) * 100;

    return {
      backgroundImage: `url(${content.imageUrl})`,
      backgroundSize: `${size * 100}% ${size * 100}%`,
      backgroundPosition: `${xPercent}% ${yPercent}%`
    };
  };

  const handleDragStart = (e: React.DragEvent, tile: TileItem) => {
    if (disabled || submitted) return;
    setDraggedTile(tile);
    e.dataTransfer.setData('text/plain', String(tile.id));
  };

  const handleDropOnSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || submitted || !draggedTile) return;

    const nextSlots = [...placedSlots];
    const prevTileInSlot = nextSlots[index];
    nextSlots[index] = draggedTile;
    setPlacedSlots(nextSlots);

    setBank((prev) => {
      const filtered = prev.filter((t) => t.id !== draggedTile.id);
      return prevTileInSlot ? [...filtered, prevTileInSlot] : filtered;
    });
    setDraggedTile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Mobile / Click-to-place support
  const handleBankTileClick = (tile: TileItem) => {
    if (disabled || submitted) return;
    if (selectedBankTile?.id === tile.id) {
      setSelectedBankTile(null);
      return;
    }
    // If a slot is empty, place directly into first empty slot
    const firstEmptyIndex = placedSlots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      const nextSlots = [...placedSlots];
      nextSlots[firstEmptyIndex] = tile;
      setPlacedSlots(nextSlots);
      setBank((prev) => prev.filter((t) => t.id !== tile.id));
      setSelectedBankTile(null);
    } else {
      setSelectedBankTile(tile);
    }
  };

  const handleSlotClick = (index: number) => {
    if (disabled || submitted) return;
    const currentInSlot = placedSlots[index];

    if (selectedBankTile) {
      // Place selected bank tile into this slot
      const nextSlots = [...placedSlots];
      nextSlots[index] = selectedBankTile;
      setPlacedSlots(nextSlots);
      setBank((prev) => {
        const filtered = prev.filter((t) => t.id !== selectedBankTile.id);
        return currentInSlot ? [...filtered, currentInSlot] : filtered;
      });
      setSelectedBankTile(null);
    } else if (currentInSlot) {
      // Return tile from slot back to bank
      const nextSlots = [...placedSlots];
      nextSlots[index] = null;
      setPlacedSlots(nextSlots);
      setBank((prev) => [...prev, currentInSlot]);
    }
  };

  const handleReset = () => {
    if (disabled || submitted) return;
    setBank(initialBank);
    setPlacedSlots(Array(totalTiles).fill(null));
    setSelectedBankTile(null);
  };

  const handleConfirm = () => {
    if (disabled || submitted || placedSlots.some((s) => s === null)) return;
    setSubmitted(true);

    const isCorrect = placedSlots.every(
      (tile, idx) => tile !== null && tile.originalPos === idx
    );

    onAnswer(isCorrect, {
      placedOrder: placedSlots.map((t) => t?.originalPos)
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
          Trascina o tocca le tessere per ricostruire l'immagine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Disordered Bank Grid */}
        <div className="flex flex-col items-center gap-3 bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            1. Tessere in disordine (Trascina o tocca)
          </span>

          <div
            className={`grid p-2 bg-slate-900 rounded-2xl border border-slate-800 ${
              size >= 4 ? 'w-72 h-72 sm:w-80 sm:h-80 gap-1' : 'w-64 h-64 gap-2'
            }`}
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
            }}
          >
            {bank.map((tile) => {
              const isSelected = selectedBankTile?.id === tile.id;
              return (
                <div
                  key={tile.id}
                  draggable={!disabled && !submitted}
                  onDragStart={(e) => handleDragStart(e, tile)}
                  onClick={() => handleBankTileClick(tile)}
                  className={`w-full h-full border shadow-md overflow-hidden hover:scale-105 active:scale-95 transition-transform cursor-grab active:cursor-grabbing relative ${
                    size >= 4 ? 'rounded-lg' : 'rounded-xl'
                  } ${
                    isSelected ? 'ring-4 ring-amber-400 border-amber-300' : 'border-white/20'
                  }`}
                  style={getTileStyle(tile.originalPos)}
                />
              );
            })}
            {bank.length === 0 && (
              <div className="col-span-full row-span-full flex items-center justify-center text-xs text-emerald-400 font-semibold">
                Tutte le tessere posizionate!
              </div>
            )}
          </div>
        </div>

        {/* Reconstruction Destination Grid */}
        <div className="flex flex-col items-center gap-3 bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
          <div className="flex items-center justify-between w-full px-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              2. Griglia ricostruita
            </span>
            <button
              type="button"
              disabled={disabled || submitted}
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Svuota
            </button>
          </div>

          <div
            className={`grid p-2 bg-slate-950 rounded-2xl border-2 border-dashed border-indigo-500/40 ${
              size >= 4 ? 'w-72 h-72 sm:w-80 sm:h-80 gap-1' : 'w-64 h-64 gap-2'
            }`}
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
            }}
          >
            {placedSlots.map((tile, idx) => (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSlot(e, idx)}
                onClick={() => handleSlotClick(idx)}
                className={`w-full h-full rounded-xl border transition-all flex items-center justify-center ${
                  tile
                    ? 'border-indigo-400 cursor-pointer shadow-lg hover:ring-2 hover:ring-rose-500'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
                style={tile ? getTileStyle(tile.originalPos) : {}}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || submitted || placedSlots.some((s) => s === null)}
        onClick={handleConfirm}
        className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer"
      >
        <CheckCircle2 className="w-6 h-6" />
        {submitted ? 'Puzzle Inviato' : 'Conferma Ricostruzione'}
      </button>
    </div>
  );
};
