import React, { useState } from 'react';
import { DrawVoteContent, DrawingSubmission } from '../../types/quiz';
import { DrawingCanvas } from '../DrawingCanvas';
import { Star, Trophy, Users, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';

interface DrawVotePlayerProps {
  content: DrawVoteContent;
  isGalleryMode?: boolean; // When true, time is up and peer star voting is active
  myPlayerId: string;
  drawings: Record<string, DrawingSubmission>;
  onSaveDrawing: (dataUrl: string) => void;
  onVoteDrawing: (targetPlayerId: string) => void;
  disabled?: boolean;
}

export const DrawVotePlayer: React.FC<DrawVotePlayerProps> = ({
  content,
  isGalleryMode = false,
  myPlayerId,
  drawings,
  onSaveDrawing,
  onVoteDrawing,
  disabled = false
}) => {
  const [hasVoted, setHasVoted] = useState<string | null>(null);

  const handleVote = (targetPlayerId: string) => {
    if (disabled || targetPlayerId === myPlayerId || hasVoted) return;
    setHasVoted(targetPlayerId);
    sound.playStar();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    onVoteDrawing(targetPlayerId);
  };

  if (!isGalleryMode) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-indigo-500/20 border border-amber-500/30 p-4 rounded-2xl text-center shadow-lg">
          <p className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
            Sfida di Disegno Creativo
          </p>
          <h3 className="text-2xl font-black text-white mt-1">"{content.prompt}"</h3>
          <p className="text-xs text-slate-300 mt-1">
            Usa i colori e le forme per rappresentare la frase!
          </p>
        </div>

        <DrawingCanvas
          onSaveDrawing={onSaveDrawing}
          disabled={disabled}
          initialData={drawings[myPlayerId]?.dataUrl}
          initialConfirmed={!!drawings[myPlayerId]}
          height={340}
        />
      </div>
    );
  }

  // Gallery & Star Voting Phase
  const drawingList = Object.values(drawings);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="text-center bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Star className="w-6 h-6 fill-amber-400 stroke-amber-400" />
          <h3 className="text-xl md:text-2xl font-black text-white">
            Galleria dei Disegni: Vota con la Stella!
          </h3>
          <Star className="w-6 h-6 fill-amber-400 stroke-amber-400" />
        </div>
        <p className="text-sm text-slate-300 mt-1">
          Guarda i capolavori della classe e assegna la tua stella ⭐ al disegno che preferisci (non al tuo)!
        </p>
      </div>

      {drawingList.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
          Nessun disegno inviato per questa sfida.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {drawingList.map((item) => {
            const isOwn = item.playerId === myPlayerId;
            const votesArray = Array.isArray(item.votes) ? item.votes : [];
            const starCount = votesArray.length;
            const isVotedByMe = votesArray.includes(myPlayerId) || hasVoted === item.playerId;

            return (
              <div
                key={item.playerId}
                className={`relative rounded-3xl overflow-hidden border-2 flex flex-col transition-all bg-slate-800/90 shadow-xl ${
                  isVotedByMe
                    ? 'border-amber-400 ring-4 ring-amber-400/30 scale-102'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Artwork Canvas View */}
                <div className="aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.dataUrl}
                    alt={`Disegno di ${item.playerName}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Footer Info & Vote Button */}
                <div className="p-4 bg-slate-850 flex items-center justify-between border-t border-slate-800">
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      {item.playerName} {isOwn && '(Tu)'}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-300">
                        {starCount} {starCount === 1 ? 'stella' : 'stelle'}
                      </span>
                    </div>
                  </div>

                  {!isOwn && (
                    <button
                      type="button"
                      disabled={disabled || hasVoted !== null}
                      onClick={() => handleVote(item.playerId)}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                        isVotedByMe
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : hasVoted !== null
                          ? 'opacity-30 bg-slate-700 text-slate-400'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isVotedByMe ? 'fill-slate-950' : ''}`} />
                      {isVotedByMe ? 'Votato!' : 'Vota'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
