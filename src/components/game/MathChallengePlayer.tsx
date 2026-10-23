import React, { useState, useEffect, useRef } from 'react';
import { MathChallengeContent } from '../../types/quiz';
import { generateMathProblems, MathProblem } from '../../utils/mathGenerator';
import { CheckCircle2, Calculator, Delete, CornerDownLeft } from 'lucide-react';

interface MathChallengePlayerProps {
  content: MathChallengeContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const MathChallengePlayer: React.FC<MathChallengePlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const [problems, setProblems] = useState<MathProblem[]>(() => {
    if (content?.generatedProblems && content.generatedProblems.length > 0) {
      return content.generatedProblems;
    }
    const ops = (content?.operators && content.operators.length > 0 ? content.operators : ['+', '-']) as ('+' | '-' | '*' | '/')[];
    const count = (content?.numberOfOperations || 2) as 1 | 2 | 3 | 4;
    const range = (content?.digitRange || 100) as 10 | 100 | 1000;
    const carry = content?.allowCarryOrRemainder || false;
    return generateMathProblems(ops, count, range, carry);
  });
  const [answers, setAnswers] = useState<string[]>(() => Array(problems.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [activeInputIdx, setActiveInputIdx] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input automatically
  useEffect(() => {
    if (inputRefs.current[0] && !disabled && !submitted) {
      inputRefs.current[0].focus();
    }
  }, [problems, disabled, submitted]);

  const handleAnswerChange = (index: number, val: string) => {
    if (disabled || submitted) return;
    // Allow numbers and negative sign
    const cleaned = val.replace(/[^0-9\-]/g, '');
    const next = [...answers];
    next[index] = cleaned;
    setAnswers(next);
  };

  // Virtual Keypad input handler for touch/mobile devices
  const handleKeypadPress = (key: string) => {
    if (disabled || submitted) return;
    const currentVal = answers[activeInputIdx] || '';
    if (key === 'del') {
      handleAnswerChange(activeInputIdx, currentVal.slice(0, -1));
    } else if (key === 'next') {
      if (activeInputIdx < problems.length - 1) {
        setActiveInputIdx(activeInputIdx + 1);
        inputRefs.current[activeInputIdx + 1]?.focus();
      }
    } else {
      handleAnswerChange(activeInputIdx, currentVal + key);
    }
  };

  const isComplete =
    problems.length > 0 &&
    answers.length === problems.length &&
    answers.every((a) => a !== undefined && a !== null && a.trim() !== '');

  const handleConfirm = () => {
    if (disabled || submitted || !isComplete) return;
    setSubmitted(true);

    const isAllCorrect = problems.every((p, idx) => {
      const num = parseInt(answers[idx].trim(), 10);
      return !isNaN(num) && num === p.answer;
    });

    onAnswer(isAllCorrect, { userAnswers: answers, problems });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      <div className="text-center">
        <p className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Calculator className="w-4 h-4" />
          Sfida di Matematica: Risolvi le seguenti operazioni
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Inserisci il risultato nei riquadri con la tastiera o usa il tastierino a schermo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {problems.map((prob, index) => {
          const isDone = answers[index]?.trim() !== '';
          const isFocused = activeInputIdx === index;

          return (
            <div
              key={index}
              onClick={() => {
                setActiveInputIdx(index);
                inputRefs.current[index]?.focus();
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-lg ${
                isFocused
                  ? 'border-indigo-400 bg-slate-800/95 ring-2 ring-indigo-500/40'
                  : isDone
                  ? 'border-emerald-500/60 bg-slate-850'
                  : 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
              }`}
            >
              <div className="text-xl md:text-2xl font-black text-amber-300 font-mono tracking-wider">
                {prob.equation} =
              </div>

              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9\-]*"
                disabled={disabled || submitted}
                value={answers[index] || ''}
                onFocus={() => setActiveInputIdx(index)}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (index < problems.length - 1) {
                      setActiveInputIdx(index + 1);
                      inputRefs.current[index + 1]?.focus();
                    } else if (isComplete) {
                      handleConfirm();
                    }
                  }
                }}
                placeholder="?"
                className="w-28 text-center text-2xl font-black py-2.5 px-3 rounded-xl bg-slate-950 border-2 border-indigo-500/70 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-600 font-mono"
              />
            </div>
          );
        })}
      </div>

      {/* Virtual Touch Keypad for Smartphones & Tablets */}
      {!submitted && !disabled && (
        <div className="bg-slate-900/95 border border-slate-800 p-3.5 rounded-2xl max-w-sm mx-auto w-full shadow-2xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2.5 px-1">
            <span>Tastierino Numerico (Operazione {activeInputIdx + 1} di {problems.length})</span>
            <span className="text-amber-400 font-mono">
              {answers[activeInputIdx] ? `Risultato: ${answers[activeInputIdx]}` : 'In attesa...'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3', 'del'].map((k) => (
              <button
                key={k}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeypadPress(k);
                }}
                className={`py-3.5 rounded-xl font-mono font-black text-base transition-all active:scale-95 cursor-pointer ${
                  k === 'del'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {k === 'del' ? <Delete className="w-5 h-5" /> : k}
              </button>
            ))}
            {['4', '5', '6', '-'].map((k) => (
              <button
                key={k}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeypadPress(k);
                }}
                className="py-3.5 rounded-xl font-mono font-black text-base bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                {k}
              </button>
            ))}
            {['7', '8', '9', 'next'].map((k) => (
              <button
                key={k}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeypadPress(k);
                }}
                className={`py-3.5 rounded-xl font-mono font-black text-base transition-all active:scale-95 cursor-pointer ${
                  k === 'next'
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {k === 'next' ? 'Avanti ➔' : k}
              </button>
            ))}
            <div className="col-span-4 flex gap-2">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeypadPress('0');
                }}
                className="w-1/3 py-3.5 rounded-xl font-mono font-black text-base bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                disabled={!isComplete}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (isComplete) handleConfirm();
                }}
                className={`w-2/3 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white cursor-pointer active:scale-95 ring-2 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700/80 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isComplete ? 'Invia Risultati 🚀' : `Compila (${answers.filter((a) => a?.trim()).length}/${problems.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submit Button */}
      <button
        type="button"
        disabled={disabled || submitted || !isComplete}
        onClick={handleConfirm}
        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${
          isComplete && !submitted && !disabled
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white active:scale-98 ring-2 ring-emerald-400/50 shadow-emerald-500/20 cursor-pointer animate-pulse'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
        }`}
      >
        <CheckCircle2 className="w-6 h-6" />
        {submitted
          ? 'Risultati Inviati!'
          : isComplete
          ? 'Conferma Risultati Ora 🚀'
          : `Compila tutti i risultati (${answers.filter((a) => a?.trim()).length}/${problems.length})`}
      </button>
    </div>
  );
};
