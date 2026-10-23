import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Palette, Square, Circle, Minus, Brush, Check, Send } from 'lucide-react';

interface DrawingCanvasProps {
  onSaveDrawing: (dataUrl: string) => void;
  disabled?: boolean;
  initialData?: string;
  initialConfirmed?: boolean;
  height?: number;
}

const COLORS = [
  '#ffffff', // White
  '#0f172a', // Slate black
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899'  // Pink
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onSaveDrawing,
  disabled = false,
  initialData,
  initialConfirmed = false,
  height = 360
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'line' | 'rect' | 'circle'>('brush');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(initialConfirmed || !!initialData);

  useEffect(() => {
    if (initialConfirmed) {
      setIsConfirmed(true);
    }
  }, [initialConfirmed]);

  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);

  // Initialize canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background with rich dark canvas tone
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData;
    }
  }, [initialData]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), imgData]);
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || isConfirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture pointer so drawing keeps tracking even if moving outside element boundary
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    saveToHistory();
    const pos = getCoordinates(e);
    startPos.current = pos;
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setIsDrawing(true);
    setHasDrawn(true);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
      ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
      ctx.stroke();
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || isConfirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCoordinates(e);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (snapshot.current) {
      // Restore previous state for shapes
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        const w = currentPos.x - startPos.current.x;
        const h = currentPos.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(currentPos.x - startPos.current.x, 2) +
          Math.pow(currentPos.y - startPos.current.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDraw = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (e && e.currentTarget) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
    // IMPORTANT: Raising the finger/pointer DOES NOT submit the drawing!
    // Submission happens exclusively when the student clicks the button "INVIA DISEGNO".
  };

  const undo = () => {
    if (disabled || isConfirmed || history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);
  };

  const clearCanvas = () => {
    if (disabled || isConfirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveToHistory();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmDrawing = () => {
    if (disabled || isConfirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setIsConfirmed(true);
    onSaveDrawing(dataUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl mx-auto select-none">
      {isConfirmed ? (
        <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-center gap-3 text-emerald-300 font-bold shadow-lg animate-fade-in text-center">
          <Check className="w-5 h-5 text-emerald-400 stroke-[3] shrink-0" />
          <span>Disegno confermato e inviato! Non è più modificabile. Attendi la fase di voto con la stella ⭐</span>
        </div>
      ) : (
        <>
          {/* Canvas Toolset */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-850 border border-slate-700/80 rounded-2xl shadow-md">
            {/* Tools */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTool('brush')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  tool === 'brush' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-750'
                }`}
                title="Pennello a mano libera"
              >
                <Brush className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  tool === 'eraser' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-750'
                }`}
                title="Gomma per cancellare"
              >
                <Eraser className="w-4 h-4" />
              </button>
              <div className="h-5 w-px bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => setTool('line')}
                className={`p-2 rounded-xl transition-all ${
                  tool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-750'
                }`}
                title="Linea retta"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTool('rect')}
                className={`p-2 rounded-xl transition-all ${
                  tool === 'rect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-750'
                }`}
                title="Rettangolo"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTool('circle')}
                className={`p-2 rounded-xl transition-all ${
                  tool === 'circle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-750'
                }`}
                title="Cerchio"
              >
                <Circle className="w-4 h-4" />
              </button>
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2 px-2">
              <span className="text-[11px] text-slate-400 font-bold">Tratto:</span>
              {[3, 6, 12, 20].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBrushSize(size)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    brushSize === size ? 'bg-indigo-500/30 ring-2 ring-indigo-400' : 'hover:bg-slate-750'
                  }`}
                >
                  <div
                    className="rounded-full bg-white"
                    style={{ width: `${Math.max(4, size * 0.7)}px`, height: `${Math.max(4, size * 0.7)}px` }}
                  />
                </button>
              ))}
            </div>

            {/* Undo & Clear */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={history.length === 0}
                onClick={undo}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-750 rounded-xl disabled:opacity-30 transition-colors"
                title="Annulla ultimo tratto"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-bold"
              >
                Pulisci
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="flex items-center justify-center gap-2 p-2 bg-slate-850/80 rounded-xl border border-slate-750">
            <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('brush');
                }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c && tool !== 'eraser'
                    ? 'scale-125 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-md'
                    : 'hover:scale-110 opacity-90'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </>
      )}

      {/* Main Drawing Canvas with Touch Action None & Pointer Events */}
      <div className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl bg-slate-950 ${
        isConfirmed ? 'border-emerald-500/60 pointer-events-none' : 'border-slate-750'
      }`}>
        <canvas
          ref={canvasRef}
          width={640}
          height={height}
          style={{ touchAction: 'none' }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={stopDraw}
          onPointerCancel={stopDraw}
          className={`w-full h-auto block bg-slate-950 ${
            isConfirmed ? 'cursor-default pointer-events-none' : 'cursor-crosshair'
          }`}
        />

        {savedSuccess && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4 stroke-[3]" />
            Disegno inviato!
          </div>
        )}
      </div>

      {/* Explicit Save & Send Button */}
      {!isConfirmed && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-300">
            Disegna liberamente sul riquadro. Quando il tuo disegno è pronto, premi <strong className="text-emerald-400">INVIA DISEGNO</strong> per mandarlo alla LIM!
          </p>
          <button
            type="button"
            onClick={handleConfirmDrawing}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            INVIA DISEGNO
          </button>
        </div>
      )}
    </div>
  );
};
