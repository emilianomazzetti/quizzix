import React, { useState, useEffect, Suspense } from 'react';
import {
  RoomState,
  Player,
  Question,
  AnswerSubmission,
  DrawingSubmission
} from '../types/quiz';
import { QuestionRenderer } from './game/QuestionRenderer';
import { lazyNamed } from '../utils/lazyNamed';
const QuestionCreator = lazyNamed(() => import('./QuestionCreator'), 'QuestionCreator');
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  PlusCircle,
  Send,
  Zap,
  Star,
  Award,
  AlertCircle,
  Maximize,
  Minimize,
  Tablet
} from 'lucide-react';
import {
  useFullscreen,
  requestAppFullscreen,
  isAppFullscreen,
  isFullscreenSupported
} from '../utils/fullscreen';

interface StudentDeviceProps {
  roomState: RoomState;
  myPlayer: Player | null;
  initialPin?: string;
  wasKicked?: boolean;
  onJoinRoom: (name: string, avatar: string, pin: string) => void;
  onSubmitQuestion: (question: Question) => void;
  onSubmitAnswer: (isCorrect: boolean, payload?: any) => void;
  onSaveDrawing: (dataUrl: string) => void;
  onVoteDrawing: (targetPlayerId: string) => void;
  onStartQuiz?: () => void;
}

const AVATARS = ['🚀', '🦊', '⚡', '🦁', '🐼', '🎨', '🌟', '🎯', '🦉', '🐬', '🏆', '🍕'];

export const StudentDevice: React.FC<StudentDeviceProps> = ({
  roomState,
  myPlayer,
  initialPin,
  wasKicked = false,
  onJoinRoom,
  onSubmitQuestion,
  onSubmitAnswer,
  onSaveDrawing,
  onVoteDrawing,
  onStartQuiz
}) => {
  // Join form state
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [pin, setPin] = useState(initialPin || roomState.roomCode);
  const [activeTab, setActiveTab] = useState<'play' | 'create'>('create');
  const [hasCreatedQuestion, setHasCreatedQuestion] = useState(false);

  const { isFullscreen, isSupported, enter: enterFullscreen, exit: exitFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // Tablet auto-fullscreen: attempt to trigger fullscreen on any user tap/touch interaction if not already fullscreen
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      if (!isAppFullscreen() && isFullscreenSupported()) {
        requestAppFullscreen().catch(() => {});
      }
    };

    window.addEventListener('touchend', handleFirstUserInteraction, { passive: true });
    window.addEventListener('click', handleFirstUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('touchend', handleFirstUserInteraction);
      window.removeEventListener('click', handleFirstUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (initialPin) setPin(initialPin);
  }, [initialPin]);

  // Active player resolution: live score from roomState or local player
  const activePlayer =
    myPlayer && roomState.players && roomState.players[myPlayer.id]
      ? roomState.players[myPlayer.id]
      : myPlayer;

  const questionsList = roomState.questions || [];
  const currentQ = questionsList[roomState.currentQuestionIndex] || questionsList[0];
  const rawAnswer =
    activePlayer && roomState.answersThisTurn
      ? roomState.answersThisTurn[activePlayer.id]
      : null;
  // Answer must belong to the current turn/question
  const myAnswer =
    rawAnswer &&
    (!roomState.turnStartTime || rawAnswer.submittedAt >= roomState.turnStartTime - 2000)
      ? rawAnswer
      : null;
  const isMyOwnQuestion =
    currentQ && activePlayer && currentQ.creatorName === activePlayer.name;

  const qTimeLimit = currentQ?.timeLimit || 25;
  const turnStartTime = roomState.turnStartTime;

  // Authoritative remaining time calculation: never resets on answer submit or re-renders
  const calculateRemainingSeconds = () => {
    if (turnStartTime) {
      const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
      return Math.max(0, qTimeLimit - elapsed);
    }
    return qTimeLimit;
  };

  const [timeRemaining, setTimeRemaining] = useState<number>(calculateRemainingSeconds);

  // Synchronized countdown timer when question is active
  useEffect(() => {
    if (roomState.phase !== 'question_active' || !currentQ) return;

    setTimeRemaining(calculateRemainingSeconds());
    const interval = setInterval(() => {
      const rem = calculateRemainingSeconds();
      setTimeRemaining(rem);
      if (rem <= 0) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [roomState.phase, roomState.currentQuestionIndex, turnStartTime, qTimeLimit]);

  // Audio & confetti on result
  useEffect(() => {
    if (roomState.phase === 'question_results' && myAnswer) {
      if (myAnswer.isCorrect) {
        sound.playCorrect();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 }
        });
      } else {
        sound.playWrong();
      }
    }
  }, [roomState.phase, myAnswer]);

  const [joinError, setJoinError] = useState<string | null>(null);

  // Active question check: does this student already have a question in the repository?
  const myCreatedQuestion = activePlayer
    ? roomState.questions?.find(
        (q) =>
          q.creatorName?.trim().toLowerCase() === activePlayer.name?.trim().toLowerCase() ||
          (q as any).creatorId === activePlayer.id
      )
    : undefined;
  const hasActiveQuestion = !!myCreatedQuestion;
  const [questionWasDeletedNotice, setQuestionWasDeletedNotice] = useState(false);
  const prevHadQuestionRef = React.useRef(hasActiveQuestion);

  // Manage lobby tab:
  // - If student already has a question in repository: stay in 'play' ("Stato Attesa Quiz")
  // - If no question (or teacher deleted it): stay in 'create' ("Crea una Domanda")
  useEffect(() => {
    if (prevHadQuestionRef.current && !hasActiveQuestion) {
      // Question was removed by teacher! Immediately reset state and return to create
      setHasCreatedQuestion(false);
      setQuestionWasDeletedNotice(true);
      setActiveTab('create');
    }
    prevHadQuestionRef.current = hasActiveQuestion;

    if (roomState.phase === 'lobby') {
      if (hasActiveQuestion) {
        setActiveTab('play');
      } else {
        setActiveTab('create');
      }
    }
  }, [roomState.phase, hasActiveQuestion]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    // Forzare Schermo Intero su Tablet / Smartphone
    if (!isAppFullscreen() && isFullscreenSupported()) {
      requestAppFullscreen().catch(() => {});
    }

    // Check duplicate student name (case-insensitive)
    const existingPlayers = Object.values(roomState.players || {});
    const isDuplicate = existingPlayers.some(
      (p) => p.name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      setJoinError(`Il nome "${cleanName}" è già presente nella sessione. Scegli un nome diverso o aggiungi l'iniziale del cognome (es. ${cleanName} M.).`);
      return;
    }

    setJoinError(null);
    onJoinRoom(cleanName, selectedAvatar, pin.trim());
  };

  const handleCreatedQuestion = (q: Question) => {
    if (hasActiveQuestion) return; // Only 1 question allowed per student
    if (!isAppFullscreen() && isFullscreenSupported()) {
      requestAppFullscreen().catch(() => {});
    }
    onSubmitQuestion(q);
    setHasCreatedQuestion(true);
    setQuestionWasDeletedNotice(false);
    setActiveTab('play'); // Immediately navigate to "Stato Attesa Quiz"
  };

  const handleAnswerWithFs = (isCorrect: boolean, payload?: any) => {
    if (!isAppFullscreen() && isFullscreenSupported()) {
      requestAppFullscreen().catch(() => {});
    }
    onSubmitAnswer(isCorrect, payload);
  };

  const handleSaveDrawingWithFs = (dataUrl: string) => {
    if (!isAppFullscreen() && isFullscreenSupported()) {
      requestAppFullscreen().catch(() => {});
    }
    onSaveDrawing(dataUrl);
  };

  const handleVoteDrawingWithFs = (targetPlayerId: string) => {
    if (!isAppFullscreen() && isFullscreenSupported()) {
      requestAppFullscreen().catch(() => {});
    }
    onVoteDrawing(targetPlayerId);
  };

  // 1. NOT LOGGED IN: Join Screen
  if (!activePlayer) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6 text-slate-100 animate-fade-in my-6">
        {/* Tablet Fullscreen Quick Button in Join Card */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Tablet className="w-4 h-4 text-indigo-400" />
            <span>Tablet & Smartphone</span>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 hover:bg-indigo-600/50'
            }`}
            title="Attiva la modalità a schermo intero sul dispositivo tablet"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Esci Schermo Intero' : 'Schermo Intero ⛶'}</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-white">Entra in FlipQuiz</h2>
          <p className="text-xs text-slate-400">
            Partecipa alla sessione della tua classe dal tuo smartphone o tablet
          </p>
        </div>

        {wasKicked && (
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300 text-xs text-center font-bold animate-fade-in">
            Sei stato rimosso dalla sessione o il database è stato azzerato. Inserisci il tuo nome per accedere nuovamente.
          </div>
        )}

        {joinError && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs text-center font-bold animate-fade-in">
            {joinError}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Codice Stanza (PIN LIM):
            </label>
            <input
              type="text"
              required
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.toUpperCase());
                setJoinError(null);
              }}
              placeholder="FLIP-XXX"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-lg font-black tracking-widest text-center text-amber-300 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Il tuo Nome:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setJoinError(null);
              }}
              placeholder="Es. Leonardo, Sofia, Matteo..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">
              Scegli il tuo Avatar:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-indigo-600 ring-2 ring-white scale-110 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-750'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
          >
            Partecipa alla Sfida!
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isAppFullscreen() && isFullscreenSupported()) {
                requestAppFullscreen().catch(() => {});
              }
              const testNames = ['Matteo B.', 'Sofia L.', 'Lorenzo T.', 'Chiara M.', 'Alessandro G.'];
              const randomName = testNames[Math.floor(Math.random() * testNames.length)];
              onJoinRoom(randomName, selectedAvatar, pin.trim() || 'FLIP-101');
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Entra rapido come studente di prova (1-Click)
          </button>
        </form>
      </div>
    );
  }

  // 2. LOGGED IN: Student App
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 text-slate-100">
      {/* Tablet Fullscreen Promotion Banner if not in fullscreen */}
      {!isFullscreen && (
        <div
          onClick={() => enterFullscreen()}
          className="p-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 border border-indigo-400 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-white cursor-pointer active:scale-98 transition-all animate-pulse"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Tablet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                MODALITÀ TABLET: SCHERMO INTERO
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                  Consigliato
                </span>
              </div>
              <div className="text-[11px] text-indigo-100">
                Tocca qui per eseguire FlipQuiz a Schermo Intero sul tablet
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              enterFullscreen();
            }}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Attiva</span>
          </button>
        </div>
      )}

      {/* Student Profile Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
            {activePlayer.avatar}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">{activePlayer.name}</h3>
            <span className="text-[11px] text-indigo-400 font-semibold">Studente Connesso</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 hover:bg-indigo-600/50'
            }`}
            title={isFullscreen ? 'Esci da schermo intero' : 'Attiva schermo intero tablet'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Esci F.S.</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schermo Intero</span>
              </>
            )}
          </button>

          {activePlayer.streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs font-black text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {activePlayer.streak}x
            </div>
          )}
          <div className="text-right">
            <span className="text-lg font-black text-emerald-400 font-mono">{activePlayer.score}</span>
            <span className="text-xs text-slate-400 ml-1">pt</span>
          </div>
        </div>
      </div>

      {/* Tabs during lobby: Play vs Create */}
      {roomState.phase === 'lobby' && (
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-2">
          {!hasActiveQuestion ? (
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Crea una Domanda
            </button>
          ) : (
            <div className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Domanda Inviata (1 max)
            </div>
          )}

          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'play'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Stato Attesa Quiz
          </button>
        </div>
      )}

      {/* TAB: CREATE QUESTION */}
      {roomState.phase === 'lobby' && activeTab === 'create' && !hasActiveQuestion && (
        <div className="space-y-4">
          {questionWasDeletedNotice && (
            <div className="p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl text-amber-200 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-lg">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                La tua domanda precedente è stata rimossa dal docente dal repository. Puoi ora formularne e inviarne una nuova!
              </span>
            </div>
          )}
          <Suspense fallback={null}>
            <QuestionCreator
            creatorName={activePlayer.name}
            onSubmitQuestion={handleCreatedQuestion}
          />
          </Suspense>
        </div>
      )}

      {/* TAB: WAITING IN LOBBY */}
      {roomState.phase === 'lobby' && (activeTab === 'play' || hasActiveQuestion) && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-4xl animate-bounce">
            ⏳
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">In Attesa del Docente</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Guarda lo schermo della LIM: quando tutti gli studenti avranno inserito la loro
              domanda, il docente avvierà la sfida live per tutta la classe!
            </p>
          </div>

          {myCreatedQuestion ? (
            <div className="p-5 bg-emerald-500/15 border-2 border-emerald-500/50 rounded-3xl text-left space-y-2 shadow-xl animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                La tua domanda è nel repository della classe:
              </div>
              <p className="text-base font-extrabold text-white">
                "{myCreatedQuestion.title}"
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-300/90 font-medium">
                <span>Tipo: <strong className="capitalize">{myCreatedQuestion.type.replace('_', ' ')}</strong></span>
                <span>•</span>
                <span>Tempo: {myCreatedQuestion.timeLimit}s</span>
              </div>
              <p className="text-[11px] text-slate-300 pt-2 border-t border-emerald-500/30">
                💡 Ogni studente può inviare <strong>una singola domanda</strong>. Se il docente la cancella dal repository della LIM, potrai formularne un'altra!
              </p>
            </div>
          ) : hasCreatedQuestion ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              La tua domanda è stata inserita con successo nel repository della classe!
            </div>
          ) : null}

          {onStartQuiz && (
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onStartQuiz}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Avvia FlipQuiz Live Subito (Test Risposte)
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUESTION INTRO */}
      {roomState.phase === 'question_intro' && currentQ && (
        <div className="bg-slate-900 border-2 border-indigo-500 p-8 rounded-3xl text-center space-y-4 shadow-2xl animate-scale-up">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
            Prossima Domanda
          </span>
          <h2 className="text-3xl font-black text-amber-300">
            {isMyOwnQuestion ? 'È LA TUA DOMANDA! 🌟' : `Creata da ${currentQ.creatorName}`}
          </h2>
          <p className="text-xs text-slate-300">
            Tieniti pronto, il tempo inizierà a scorrere tra pochissimi secondi!
          </p>
        </div>
      )}

      {/* QUESTION ACTIVE */}
      {roomState.phase === 'question_active' && currentQ && (
        <div className="space-y-6">
          {/* Header Bar with Countdown and Badge */}
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Autore:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black">
                {currentQ.creatorName}
              </span>
            </div>

            {/* Circular Timer Pill */}
            <div
              className={`px-3 py-1 rounded-xl font-mono text-sm font-black flex items-center gap-1.5 transition-colors ${
                timeRemaining <= 5
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              <Clock className="w-4 h-4" />
              {timeRemaining}s
            </div>
          </div>

          {/* Interactive Player Switcher */}
          {(() => {
            const isContinuousGame =
              currentQ.type === 'draw_vote' ||
              currentQ.type === 'word_builder' ||
              currentQ.type === 'longest_word' ||
              currentQ.type === 'mole_whack' ||
              currentQ.type === 'word_search';

            return (
              <>
                <QuestionRenderer
                  question={currentQ}
                  onAnswer={handleAnswerWithFs}
                  disabled={isContinuousGame ? (timeRemaining <= 0 && (!roomState.turnStartTime || Date.now() - roomState.turnStartTime > 2000)) : myAnswer !== null}
                  myPlayerId={activePlayer.id}
                  drawings={roomState.drawingsThisTurn || {}}
                  isGalleryMode={false}
                  onSaveDrawing={handleSaveDrawingWithFs}
                  onVoteDrawing={handleVoteDrawingWithFs}
                />

                {currentQ.type === 'draw_vote' ? (
                  roomState.drawingsThisTurn && roomState.drawingsThisTurn[activePlayer.id] ? (
                    <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500/60 rounded-2xl text-center text-sm font-black text-emerald-300 flex items-center justify-center gap-2 shadow-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-400 stroke-[3]" />
                      <span>Disegno inviato con successo! Attendi la fase di voto con le stelle ⭐</span>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400">
                      Disegna sul riquadro qui sopra e tocca Conferma Disegno per inviarlo! ⭐
                    </div>
                  )
                ) : currentQ.type === 'word_builder' ? (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-300">
                    {myAnswer && myAnswer.answerPayload?.totalLetters > 0 ? (
                      <span className="text-emerald-300 font-bold">
                        Lettere totali accumulate: {myAnswer.answerPayload.totalLetters} (+{myAnswer.pointsAwarded} pt)! Continua a formare altre parole prima dello scadere del tempo!
                      </span>
                    ) : (
                      'Componi quante più parole possibili (1 lettera = 1 punto) prima dello scadere del tempo!'
                    )}
                  </div>
                ) : currentQ.type === 'longest_word' ? (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-300">
                    {myAnswer && myAnswer.answerPayload?.word ? (
                      <span className="text-fuchsia-300 font-bold">
                        Parola più lunga registrata: "{myAnswer.answerPayload.word}" ({myAnswer.answerPayload.length} lettere • {myAnswer.pointsAwarded} pt)! Continua a cercare parole più lunghe!
                      </span>
                    ) : (
                      'Crea la parola più lunga possibile con le 14 lettere prima dello scadere del tempo! (+25 punti bonus al vincitore)'
                    )}
                  </div>
                ) : currentQ.type === 'mole_whack' ? (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-300">
                    Becca le talpe con la categoria indicata in alto fino allo scadere del tempo!
                  </div>
                ) : currentQ.type === 'word_search' ? (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-300">
                    {myAnswer && myAnswer.answerPayload?.foundWords?.length > 0 ? (
                      <span className="text-emerald-300 font-bold">
                        Parole trovate finora: {myAnswer.answerPayload.foundWords.length} su {myAnswer.answerPayload.totalWords || (currentQ.content as any)?.words?.length || 4} (+{myAnswer.pointsAwarded} pt)! Continua a cercare prima dello scadere del tempo!
                      </span>
                    ) : (
                      'Tocca le lettere per trovare le parole nascoste. Ricevi punti per ciascuna parola scovata!'
                    )}
                  </div>
                ) : myAnswer ? (
                  <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500/60 rounded-2xl text-center text-sm font-black text-emerald-300 flex items-center justify-center gap-2 animate-bounce shadow-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-400 stroke-[3]" />
                    <span>Risposta registrata con successo!</span>
                    <span className="text-xs bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                      {myAnswer.isCorrect ? `+${myAnswer.pointsAwarded} pt` : 'Registrata'}
                    </span>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400">
                    Tocca la risposta per registrarla sul monitor della classe.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* QUESTION RESULTS */}
      {roomState.phase === 'question_results' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in">
          {myAnswer ? (
            <div className="space-y-4">
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-xl ${
                  myAnswer.isCorrect
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300'
                    : 'bg-rose-500/20 border-2 border-rose-400 text-rose-300'
                }`}
              >
                {myAnswer.isCorrect ? '🎉' : '❌'}
              </div>

              <h3 className="text-2xl font-black text-white">
                {myAnswer.isCorrect ? 'Risposta Esatta!' : 'Peccato, risposta errata!'}
              </h3>

              <div className="flex items-center justify-center gap-3">
                <span className="px-4 py-2 rounded-2xl bg-slate-800 text-base font-black text-amber-300">
                  +{myAnswer.pointsAwarded} pt
                </span>
                {myAnswer.speedRank && (
                  <span className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-xs font-black text-amber-300 flex items-center gap-1">
                    <Zap className="w-4 h-4 fill-amber-400" />
                    {myAnswer.speedRank}° Dito più Veloce!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-300">Tempo Scaduto</h3>
              <p className="text-xs text-slate-500">Non hai inviato la risposta in tempo per questo turno.</p>
            </div>
          )}

          <p className="text-xs text-slate-400 pt-2">
            Guarda la LIM del docente per scoprire la classifica aggiornata!
          </p>
        </div>
      )}

      {/* DRAW GALLERY & PEER VOTING */}
      {roomState.phase === 'draw_gallery' && currentQ && (
        <QuestionRenderer
          question={currentQ}
          onAnswer={() => {}}
          myPlayerId={activePlayer.id}
          drawings={roomState.drawingsThisTurn || {}}
          isGalleryMode={true}
          onSaveDrawing={handleSaveDrawingWithFs}
          onVoteDrawing={handleVoteDrawingWithFs}
        />
      )}

      {/* LEADERBOARD & PODIUM */}
      {(roomState.phase === 'leaderboard' || roomState.phase === 'podium') && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl animate-fade-in">
          <Trophy className="w-16 h-16 mx-auto text-amber-400 fill-amber-400" />
          <h3 className="text-2xl font-black text-white">
            {roomState.phase === 'podium' ? 'Fine Partita!' : 'Classifica Turno'}
          </h3>
          <p className="text-xs text-slate-400">
            Il tuo punteggio attuale è <strong className="text-amber-300 font-bold">{activePlayer.score} punti</strong>.
          </p>
          <p className="text-xs text-slate-500">
            Guarda la LIM per i dettagli del turno e i vincitori sul podio!
          </p>
        </div>
      )}
    </div>
  );
};
