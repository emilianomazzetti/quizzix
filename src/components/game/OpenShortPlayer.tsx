import React, { useState } from 'react';
import { OpenShortContent } from '../../types/quiz';
import { Send, CheckCircle2 } from 'lucide-react';

interface OpenShortPlayerProps {
  content: OpenShortContent;
  imageUrl?: string;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
}

export const OpenShortPlayer: React.FC<OpenShortPlayerProps> = ({
  content,
  imageUrl,
  onAnswer,
  disabled = false
}) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitted || !answer.trim()) return;

    setSubmitted(true);
    const cleaned = answer.trim().toLowerCase();
    const isCorrect = content.acceptedAnswers.some(
      (acc) => acc.trim().toLowerCase() === cleaned
    );

    onAnswer(isCorrect, { answer: answer.trim() });
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {imageUrl && (
        <div className="w-full max-h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
          <img src={imageUrl} alt="Immagine di supporto" className="max-h-64 w-auto object-contain" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            disabled={disabled || submitted}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Scrivi qui la tua risposta breve..."
            className="w-full text-center text-xl md:text-2xl font-bold py-5 px-6 rounded-2xl bg-slate-800 border-2 border-indigo-500/50 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white placeholder-slate-500 shadow-xl"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={disabled || submitted || !answer.trim()}
          className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-98"
        >
          {submitted ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Risposta Inviata!
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Invia Risposta
            </>
          )}
        </button>
      </form>
    </div>
  );
};
