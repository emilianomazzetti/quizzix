import React, { useState } from 'react';
import { LongestWordContent } from '../../types/quiz';
import { canFormWord, isValidItalianWord, verifyItalianWordOnline } from '../../utils/wordDictionary';
import { sound } from '../../utils/audio';
import { Trophy, Check, AlertCircle, Sparkles, Send, Award, Loader2, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LongestWordPlayerProps {
  content: LongestWordContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const LongestWordPlayer: React.FC<LongestWordPlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const consonants = content.consonants || ['C', 'R', 'T', 'N', 'L', 'S', 'P', 'M', 'D', 'G'];
  const vowels = content.vowels || ['A', 'E', 'I', 'O'];
  const allLetters = [...consonants, ...vowels];

  const [currentInput, setCurrentInput] = useState('');
  const [bestWord, setBestWord] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleTestWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !currentInput.trim() || isValidating) return;

    const word = currentInput.trim().toUpperCase();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Rule 1: Min length 2
    if (word.length < 2) {
      setErrorMessage('La parola deve avere almeno 2 lettere.');
      return;
    }

    // Rule 2: Must be formable from pool
    if (!canFormWord(word, allLetters)) {
      setErrorMessage('Usa solo le 14 lettere a disposizione in alto (rispettando il numero di volte che compaiono)!');
      return;
    }

    // Rule 3: Mandatory vowel check (in Italian every word must contain at least one vowel)
    if (!/[AEIOUÀÈÉÌÒÙ]/i.test(word)) {
      setErrorMessage(`"${word}" non contiene alcuna vocale. In italiano tutte le parole devono avere almeno una vocale!`);
      return;
    }

    // Rule 4: Valid Italian word check (instant offline set + online verification fallback)
    setIsValidating(true);
    let isValid = isValidItalianWord(word);
    if (!isValid) {
      isValid = await verifyItalianWordOnline(word);
    }
    setIsValidating(false);

    if (!isValid) {
      setErrorMessage(`"${word}" non è stata trovata nel vocabolario della lingua italiana.`);
      return;
    }

    // Valid word! Check if it's the student's new personal best
    if (word.length > bestWord.length) {
      setBestWord(word);
      setSuccessMessage(`Ottimo! Nuovo record personale: "${word}" (${word.length} lettere)!`);
      sound.playCorrect();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Update room state with this player's best word and length
      onAnswer(true, {
        word,
        length: word.length,
        summary: `${word} (${word.length} lettere)`
      });
    } else if (word === bestWord) {
      setSuccessMessage(`Hai già registrato "${word}" come tuo record!`);
    } else {
      setSuccessMessage(`Parola valida ("${word}", ${word.length} lettere), ma il tuo record è "${bestWord}" (${bestWord.length} lettere)!`);
    }

    setCurrentInput('');
  };

  const insertChar = (char: string) => {
    if (disabled) return;
    setCurrentInput((prev) => prev + char);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 select-none">
      {/* 14 Available Letters (10 Consonants + 4 Vowels) */}
      <div className="bg-slate-900 border-2 border-fuchsia-500/50 p-6 rounded-3xl text-center shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-widest text-fuchsia-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            14 Lettere a Disposizione:
          </span>
          <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
            Chi trova la parola più lunga vince +25 Bonus!
          </span>
        </div>

        {/* Consonants Row */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            10 Consonanti:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {consonants.map((c, i) => (
              <button
                key={`c-${i}`}
                type="button"
                disabled={disabled}
                onClick={() => insertChar(c)}
                className="w-11 h-13 md:w-12 md:h-14 rounded-2xl font-black text-xl md:text-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-md transition-all flex items-center justify-center cursor-pointer border border-indigo-400/40"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Vowels Row */}
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
            4 Vocali:
          </span>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {vowels.map((v, i) => (
              <button
                key={`v-${i}`}
                type="button"
                disabled={disabled}
                onClick={() => insertChar(v)}
                className="w-11 h-13 md:w-12 md:h-14 rounded-2xl font-black text-xl md:text-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 shadow-md transition-all flex items-center justify-center cursor-pointer border border-amber-300/40"
              >
                {v}
              </button>
            ))}
            <button
              type="button"
              disabled={disabled || !currentInput}
              onClick={() => {
                setCurrentInput((prev) => prev.slice(0, -1));
                setErrorMessage(null);
              }}
              className="px-3.5 h-11 md:h-14 rounded-2xl font-bold text-xs bg-rose-900/80 hover:bg-rose-800 active:scale-95 text-rose-200 border border-rose-600/50 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Cancella ultima lettera"
            >
              <Delete className="w-4 h-4" />
              CANCELLA
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Tocca le lettere o scrivi sulla tastiera. Puoi inviare più tentativi: verrà conteggiata la tua parola più lunga!
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleTestWord} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            disabled={disabled}
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value.toUpperCase());
              setErrorMessage(null);
            }}
            placeholder="Componi la parola più lunga..."
            className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-850 border-2 border-slate-700 focus:border-fuchsia-400 focus:outline-none text-xl font-black text-white uppercase placeholder-slate-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={disabled || !currentInput.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-40 text-white font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
            Invia Parola
          </button>
        </div>

        {currentInput && (
          <div className="text-xs text-slate-400 px-2 font-mono">
            Lunghezza attuale: <strong className="text-white">{currentInput.length} lettere</strong> ({currentInput.length} pt)
          </div>
        )}

        {errorMessage && (
          <div className="text-xs text-rose-400 font-bold flex items-center gap-1.5 px-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 px-2 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            {successMessage}
          </div>
        )}
      </form>

      {/* Current Best Word Showcase */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              La tua parola più lunga registrata:
            </h4>
            {bestWord ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-black text-white font-mono">{bestWord}</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                  {bestWord.length} lettere
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Nessuna parola valida registrata ancora.
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-semibold">Punti provvisori:</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            {bestWord ? 50 + bestWord.length : 0} pt
          </span>
        </div>
      </div>
    </div>
  );
};
