import React, { useState } from 'react';
import { WordBuilderContent } from '../../types/quiz';
import { canFormWord, isValidItalianWord, verifyItalianWordOnline, VALID_2_LETTER_WORDS } from '../../utils/wordDictionary';
import { Plus, Check, AlertCircle, Loader2, Delete } from 'lucide-react';
import { sound } from '../../utils/audio';

interface WordBuilderPlayerProps {
  content: WordBuilderContent;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const WordBuilderPlayer: React.FC<WordBuilderPlayerProps> = ({
  content,
  onAnswer,
  disabled = false
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [createdWords, setCreatedWords] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const allAvailableLetters = [...content.consonants, ...content.vowels];

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !currentInput.trim() || isValidating) return;

    const word = currentInput.trim().toUpperCase();
    setErrorMessage(null);

    // Rule 1: Not already found
    if (createdWords.includes(word)) {
      setErrorMessage('Parola già inserita!');
      return;
    }

    // Rule 2: Minimum 2 letters
    if (word.length < 2) {
      setErrorMessage('La parola deve avere almeno 2 lettere.');
      return;
    }

    // Rule 3: Must be formable from pool
    if (!canFormWord(word, allAvailableLetters)) {
      setErrorMessage('Usa solo le lettere disponibili in alto!');
      return;
    }

    // Rule 4: Mandatory vowel check (Italian phonetics: every Italian word MUST contain at least one vowel)
    if (!/[AEIOUÀÈÉÌÒÙ]/i.test(word)) {
      setErrorMessage(`"${word}" non contiene alcuna vocale. In italiano tutte le parole devono avere almeno una vocale!`);
      return;
    }

    // Rule 5: If 2 letters, must be an authentic Italian 2-letter word
    if (word.length === 2 && !VALID_2_LETTER_WORDS.has(word.toLowerCase())) {
      setErrorMessage(`"${word}" non è una parola italiana valida di 2 lettere.`);
      return;
    }

    // Rule 6: Valid Italian dictionary check (instant offline set + online verification fallback)
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

    // Success!
    sound.playCorrect();
    const updated = [...createdWords, word];
    setCreatedWords(updated);
    setCurrentInput('');

    // Score rule: 1 letter = 1 point across all valid words formed
    const totalLetters = updated.reduce((acc, w) => acc + w.length, 0);

    // Update parent with current score count
    onAnswer(true, {
      words: updated,
      count: updated.length,
      totalLetters,
      lastWord: word,
      summary: `${updated.length} parole (${totalLetters} lettere)`
    });
  };

  const insertChar = (char: string) => {
    if (disabled) return;
    setCurrentInput((prev) => prev + char);
  };

  const totalLettersUsed = createdWords.reduce((acc, w) => acc + w.length, 0);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Available Letters Display */}
      <div className="bg-slate-800/90 border-2 border-indigo-500/50 p-6 rounded-3xl text-center shadow-xl flex flex-col gap-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300">
          Lettere a disposizione (5 consonanti + 2 vocali):
        </span>

        <div className="flex flex-wrap gap-2.5 justify-center">
          {content.consonants.map((c, i) => (
            <button
              key={`c-${i}`}
              type="button"
              disabled={disabled}
              onClick={() => insertChar(c)}
              className="w-12 h-14 md:w-14 md:h-16 rounded-2xl font-black text-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              {c}
            </button>
          ))}

          <div className="w-1 bg-slate-700 mx-1 rounded-full self-stretch" />

          {content.vowels.map((v, i) => (
            <button
              key={`v-${i}`}
              type="button"
              disabled={disabled}
              onClick={() => insertChar(v)}
              className="w-12 h-14 md:w-14 md:h-16 rounded-2xl font-black text-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              {v}
            </button>
          ))}

          <div className="w-1 bg-slate-700 mx-1 rounded-full self-stretch" />

          {/* Pulsante CANCELLA rapido */}
          <button
            type="button"
            disabled={disabled || !currentInput}
            onClick={() => {
              setCurrentInput((prev) => prev.slice(0, -1));
              setErrorMessage(null);
            }}
            className="px-4 h-14 md:h-16 rounded-2xl font-black text-xs md:text-sm bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            title="Cancella l'ultima lettera"
          >
            <Delete className="w-4 h-4" />
            <span>CANCELLA</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Componi quante più parole possibili prima dello scadere del tempo. <strong>Regola: 1 lettera = 1 punto!</strong>
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddWord} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            disabled={disabled}
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value.toUpperCase());
              setErrorMessage(null);
            }}
            placeholder="Scrivi una parola e premi Invio..."
            className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-850 border-2 border-slate-700 focus:border-indigo-400 focus:outline-none text-xl font-black text-white uppercase placeholder-slate-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={disabled || !currentInput.trim() || isValidating}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifica...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Aggiungi
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 px-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}
      </form>

      {/* Formed Words Collection */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Le tue parole valide ({createdWords.length}):
          </h4>
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
            {totalLettersUsed} lettere (+{totalLettersUsed} pt)
          </span>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[48px]">
          {createdWords.map((w, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-black flex items-center gap-1.5 animate-scale-up"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{w}</span>
              <span className="text-[11px] text-emerald-400/80 font-mono">({w.length} pt)</span>
            </div>
          ))}
          {createdWords.length === 0 && (
            <span className="text-xs text-slate-500 italic self-center">
              Nessuna parola inserita finora. Comincia a comporre!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
