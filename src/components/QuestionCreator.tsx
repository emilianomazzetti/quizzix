import React, { useState } from 'react';
import {
  Question,
  QuestionType,
  MultipleChoiceContent,
  TrueFalseContent,
  OpenShortContent,
  FillBlanksContent,
  MemoryMatchContent,
  AssociationPair,
  SimpleAssociationContent,
  MoleWhackContent,
  DrawVoteContent,
  CellIdentifyContent,
  OrderCellsContent,
  AnagramContent,
  PuzzleContent,
  WordSearchContent,
  MathChallengeContent,
  WordBuilderContent,
  LongestWordContent
} from '../types/quiz';
import { ImagePickerModal } from './ImagePickerModal';
import { generateMathProblems } from '../utils/mathGenerator';
import { shuffle } from '../utils/shuffle';
import {
  HelpCircle,
  Clock,
  Image as ImageIcon,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  Send,
  Eye,
  Type,
  Grid,
  Palette,
  Calculator,
  Shuffle,
  Award
} from 'lucide-react';

interface QuestionCreatorProps {
  creatorName: string;
  onSubmitQuestion: (question: Question) => void;
  onCancel?: () => void;
}

const QUESTION_TYPES_INFO: {
  type: QuestionType;
  label: string;
  description: string;
  icon: any;
  color: string;
}[] = [
  {
    type: 'multiple_choice',
    label: 'Risposta Multipla',
    description: 'Scelta tra opzioni, 1 sola corretta con immagine facoltativa',
    icon: HelpCircle,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    type: 'true_false',
    label: 'Vero o Falso',
    description: 'Due sole scelte immediate (Vero/Falso)',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    type: 'open_short',
    label: 'Risposta Aperta',
    description: 'Breve testo da digitare (non conta maiuscole/minuscole)',
    icon: Type,
    color: 'from-amber-500 to-orange-600'
  },
  {
    type: 'fill_blanks',
    label: 'Risposta a Buchi',
    description: 'Tocca una parola per evidenziarla in giallo e nasconderla',
    icon: Sparkles,
    color: 'from-yellow-500 to-amber-600'
  },
  {
    type: 'memory_match',
    label: 'Associazione Semplice',
    description: 'Coppie di celle con testo, immagine o entrambi da abbinare',
    icon: Grid,
    color: 'from-purple-500 to-violet-600'
  },
  {
    type: 'mole_whack',
    label: 'Becca la Talpa',
    description: 'Colpisci le talpe con il cartellino della categoria corretta (-10pt errori)',
    icon: Sparkles,
    color: 'from-amber-600 to-orange-700'
  },
  {
    type: 'draw_vote',
    label: 'Disegna & Votazione',
    description: 'Canvas per disegnare la stimolazione e votazione con stelle',
    icon: Palette,
    color: 'from-pink-500 to-rose-600'
  },
  {
    type: 'cell_identify',
    label: 'Identifica Celle',
    description: 'Clicca su tutte le celle che rispondono allo stimolo',
    icon: CheckCircle,
    color: 'from-cyan-500 to-blue-600'
  },
  {
    type: 'order_cells',
    label: 'Ordina le Celle',
    description: '4 celle da riordinare in sequenza logica o cronologica',
    icon: Shuffle,
    color: 'from-teal-500 to-emerald-600'
  },
  {
    type: 'anagram',
    label: 'Anagramma',
    description: 'Lettere mescolate da ricomporre per formare la parola',
    icon: Type,
    color: 'from-indigo-500 to-violet-600'
  },
  {
    type: 'puzzle',
    label: 'Puzzle',
    description: 'Immagine scomposta in tessere da ricostruire nella griglia',
    icon: Grid,
    color: 'from-orange-500 to-red-600'
  },
  {
    type: 'word_search',
    label: 'Crucipuzzle',
    description: 'Griglia di lettere con parole nascoste e caratteri casuali',
    icon: Grid,
    color: 'from-blue-600 to-cyan-700'
  },
  {
    type: 'math_challenge',
    label: 'Matematica',
    description: 'Generatore calcoli (+, -, x, :) con riporti e limiti',
    icon: Calculator,
    color: 'from-violet-600 to-purple-700'
  },
  {
    type: 'word_builder',
    label: 'Più Parole',
    description: '5 consonanti + 2 vocali: forma più parole possibili (1 lettera 1 pt)',
    icon: Type,
    color: 'from-lime-500 to-emerald-600'
  },
  {
    type: 'longest_word',
    label: 'La Parola Più Lunga',
    description: '10 consonanti + 4 vocali: trova la parola più lunga (+25 Bonus)',
    icon: Award,
    color: 'from-fuchsia-500 to-pink-600'
  }
];

export const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  creatorName,
  onSubmitQuestion,
  onCancel
}) => {
  const [selectedType, setSelectedType] = useState<QuestionType>('multiple_choice');
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState<number>(25);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [activeImagePickerTarget, setActiveImagePickerTarget] = useState<string>('main');

  // --- Specific Content States ---
  // Multiple Choice (with optional option images)
  const [mcOptions, setMcOptions] = useState<
    { id: string; text: string; isCorrect: boolean; imageUrl?: string }[]
  >([
    { id: 'opt-1', text: '', isCorrect: true },
    { id: 'opt-2', text: '', isCorrect: false },
    { id: 'opt-3', text: '', isCorrect: false },
    { id: 'opt-4', text: '', isCorrect: false }
  ]);

  // True / False
  const [tfCorrect, setTfCorrect] = useState<boolean>(true);

  // Open Short
  const [openAnswers, setOpenAnswers] = useState<string>('');

  // Fill Blanks - support multiple custom blanks with distractors
  const [fillSentence, setFillSentence] = useState('MARIO VA AL MARE IN VACANZA');
  const [blankItems, setBlankItems] = useState<{ id: string; correctWord: string; distractors: string[] }[]>([
    { id: 'b-0', correctWord: 'MARE', distractors: ['MONTAGNA', 'LAGO', 'COLLINA'] }
  ]);

  // Associazione Semplice (4 pairs with text, image, or both on each cell)
  const [simpleAssocPairs, setSimpleAssocPairs] = useState<AssociationPair[]>([
    {
      id: 'm1',
      itemA: { image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80', text: '' },
      itemB: { text: 'Napoleone Bonaparte', image: '' }
    },
    {
      id: 'm2',
      itemA: { image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80', text: '' },
      itemB: { text: 'Colosseo di Roma', image: '' }
    },
    {
      id: 'm3',
      itemA: { image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&auto=format&fit=crop&q=80', text: '' },
      itemB: { text: 'Piramidi di Giza', image: '' }
    },
    {
      id: 'm4',
      itemA: { image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&auto=format&fit=crop&q=80', text: '' },
      itemB: { text: 'Leone della Savana', image: '' }
    }
  ]);

  // Becca la Talpa (Whack-a-Mole)
  const [moleCategory, setMoleCategory] = useState<'nomi' | 'aggettivi' | 'verbi' | 'articoli'>('nomi');
  const [moleDuration, setMoleDuration] = useState<2 | 3 | 4 | 5 | 6 | 'casuale'>('casuale');
  const [moleGridSize, setMoleGridSize] = useState<3 | 4>(3);

  // Draw Vote
  const [drawPrompt, setDrawPrompt] = useState('Disegna un gatto con gli occhiali da sole');

  // Cell Identify
  const [cellStimulus, setCellStimulus] = useState('NAPOLEONE');
  const [identifyCells, setIdentifyCells] = useState<
    { id: string; text: string; isMatch: boolean }[]
  >([
    { id: 'c1', text: 'Bonaparte', isMatch: true },
    { id: 'c2', text: 'Cavallo Bianco', isMatch: true },
    { id: 'c3', text: 'Waterloo', isMatch: true },
    { id: 'c4', text: 'Banana', isMatch: false },
    { id: 'c5', text: 'Incoronazione', isMatch: true },
    { id: 'c6', text: 'Torre Eiffel', isMatch: false }
  ]);

  // Order Cells
  const [orderItems, setOrderItems] = useState<{ id: string; text: string; image?: string }[]>([
    { id: 'ord-1', text: 'Primavera', image: '' },
    { id: 'ord-2', text: 'Estate', image: '' },
    { id: 'ord-3', text: 'Autunno', image: '' },
    { id: 'ord-4', text: 'Inverno', image: '' }
  ]);

  // Anagram
  const [anagramWord, setAnagramWord] = useState('PLANISFERO');

  // Puzzle
  const [puzzleImage, setPuzzleImage] = useState(
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80'
  );
  const [puzzleGridSize, setPuzzleGridSize] = useState<2 | 3 | 4 | 5>(2);

  // Word Search
  const [wordSearchList, setWordSearchList] = useState<string>('ROMA, SOLE, MARE, LUNA');

  // Math Challenge
  const [mathOps, setMathOps] = useState<('+' | '-' | '*' | '/')[]>(['+', '-']);
  const [mathCount, setMathCount] = useState<1 | 2 | 3 | 4>(2);
  const [mathRange, setMathRange] = useState<10 | 100 | 1000>(100);
  const [mathCarry, setMathCarry] = useState(false);

  // Word Builder (Più Parole)
  const [builderConsonants, setBuilderConsonants] = useState<string[]>(['R', 'S', 'T', 'M', 'P']);
  const [builderVowels, setBuilderVowels] = useState<string[]>(['A', 'E']);

  // La Parola Più Lunga (10 consonanti + 4 vocali)
  const [longestConsonants, setLongestConsonants] = useState<string[]>([
    'C', 'R', 'T', 'N', 'L', 'S', 'P', 'M', 'D', 'G'
  ]);
  const [longestVowels, setLongestVowels] = useState<string[]>([
    'A', 'E', 'I', 'O'
  ]);

  const randomizeLongestLetters = () => {
    const C_POOL = ['B', 'C', 'D', 'F', 'G', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'Z'];
    const V_POOL = ['A', 'E', 'I', 'O', 'U'];
    const shuffledC = shuffle(C_POOL);
    const shuffledV = shuffle(V_POOL);
    setLongestConsonants(shuffledC.slice(0, 10));
    setLongestVowels(shuffledV.slice(0, 4));
  };

  const randomizeBuilderLetters = () => {
    const C_POOL = ['R', 'S', 'T', 'L', 'N', 'C', 'M', 'P', 'D', 'G', 'B', 'V', 'F'];
    const V_POOL = ['A', 'E', 'I', 'O', 'U'];
    const shuffledC = shuffle(C_POOL);
    const shuffledV = shuffle(V_POOL);
    setBuilderConsonants(shuffledC.slice(0, 5));
    setBuilderVowels(shuffledV.slice(0, 2));
  };

  const openImagePicker = (target: string) => {
    setActiveImagePickerTarget(target);
    setIsImagePickerOpen(true);
  };

  const handleImagePicked = (url: string) => {
    if (activeImagePickerTarget === 'main') {
      setMainImageUrl(url);
    } else if (activeImagePickerTarget === 'puzzle') {
      setPuzzleImage(url);
    } else if (activeImagePickerTarget.startsWith('mc-opt-')) {
      const optId = activeImagePickerTarget.replace('mc-opt-', '');
      setMcOptions((prev) =>
        prev.map((o) => (o.id === optId ? { ...o, imageUrl: url } : o))
      );
    } else if (activeImagePickerTarget.startsWith('assoc-')) {
      const parts = activeImagePickerTarget.split('-');
      const pairIdx = parseInt(parts[1], 10);
      const col = parts[2]; // 'A' or 'B'
      setSimpleAssocPairs((prev) => {
        const next = [...prev];
        if (col === 'A') {
          next[pairIdx] = {
            ...next[pairIdx],
            itemA: { ...(next[pairIdx].itemA || {}), image: url }
          };
        } else {
          next[pairIdx] = {
            ...next[pairIdx],
            itemB: { ...(next[pairIdx].itemB || {}), image: url }
          };
        }
        return next;
      });
    } else if (activeImagePickerTarget.startsWith('order-')) {
      const idx = parseInt(activeImagePickerTarget.replace('order-', ''), 10);
      setOrderItems((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = { ...next[idx], image: url };
        }
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Inserisci il titolo o testo della domanda!');
      return;
    }

    let content: any = {};

    if (selectedType === 'multiple_choice') {
      if (mcOptions.some((o) => !o.text.trim())) {
        alert('Compila il testo di tutte le opzioni!');
        return;
      }
      content = { options: mcOptions } as MultipleChoiceContent;
    } else if (selectedType === 'true_false') {
      content = { isTrueCorrect: tfCorrect } as TrueFalseContent;
    } else if (selectedType === 'open_short') {
      const answers = openAnswers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (answers.length === 0) {
        alert('Inserisci almeno una risposta valida!');
        return;
      }
      content = { acceptedAnswers: answers } as OpenShortContent;
    } else if (selectedType === 'fill_blanks') {
      const blanks = blankItems.length > 0 ? blankItems : [
        { id: 'b-0', correctWord: 'MARE', distractors: ['MONTAGNA', 'LAGO', 'COLLINA'] }
      ];
      content = {
        originalText: fillSentence,
        blankWord: blanks[0]?.correctWord || '',
        distractors: blanks[0]?.distractors || [],
        blanks: blanks
      } as FillBlanksContent;
    } else if (selectedType === 'memory_match') {
      const normalizedPairs = simpleAssocPairs.map((p) => ({
        ...p,
        image: p.itemA?.image || p.itemB?.image || '',
        text: p.itemB?.text || p.itemA?.text || ''
      }));
      content = { pairs: normalizedPairs } as SimpleAssociationContent;
    } else if (selectedType === 'mole_whack') {
      content = {
        category: moleCategory,
        duration: moleDuration,
        gridSize: 3
      } as MoleWhackContent;
    } else if (selectedType === 'draw_vote') {
      content = { prompt: drawPrompt || title } as DrawVoteContent;
    } else if (selectedType === 'cell_identify') {
      content = { stimulus: cellStimulus, cells: identifyCells } as CellIdentifyContent;
    } else if (selectedType === 'order_cells') {
      content = { correctOrder: orderItems } as OrderCellsContent;
    } else if (selectedType === 'anagram') {
      content = { phraseOrWord: anagramWord } as AnagramContent;
    } else if (selectedType === 'puzzle') {
      content = { imageUrl: puzzleImage, gridSize: puzzleGridSize } as PuzzleContent;
    } else if (selectedType === 'word_search') {
      const words = wordSearchList
        .split(',')
        .map((w) => w.trim().toUpperCase())
        .filter(Boolean);
      content = { words, gridSize: 8 } as WordSearchContent;
    } else if (selectedType === 'math_challenge') {
      const generatedProblems = generateMathProblems(mathOps, mathCount, mathRange, mathCarry);
      content = {
        operators: mathOps,
        numberOfOperations: mathCount,
        digitRange: mathRange,
        allowCarryOrRemainder: mathCarry,
        generatedProblems
      } as MathChallengeContent;
    } else if (selectedType === 'word_builder') {
      content = {
        consonants: builderConsonants,
        vowels: builderVowels
      } as WordBuilderContent;
    } else if (selectedType === 'longest_word') {
      content = {
        consonants: longestConsonants,
        vowels: longestVowels
      } as LongestWordContent;
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: selectedType,
      title: title.trim(),
      creatorName: creatorName || 'Studente',
      timeLimit,
      points: 50,
      imageUrl: mainImageUrl || undefined,
      content,
      createdAt: Date.now(),
      approved: true
    };

    onSubmitQuestion(newQuestion);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
            Flipped Classroom • Crea la tua domanda
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
            Editor Domanda FlipQuiz
          </h2>
          <p className="text-xs text-slate-400">
            Creatore: <strong className="text-indigo-300 font-bold">{creatorName}</strong> — La tua domanda verrà proiettata sulla LIM della classe!
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors self-start sm:self-auto"
          >
            Annulla
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Pick Question Type */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">
              1
            </span>
            Scegli la tipologia di gioco:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {QUESTION_TYPES_INFO.map((item) => {
              const isSelected = selectedType === item.type;
              const Icon = item.icon;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[90px] ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500/20 ring-4 ring-indigo-500/30 scale-102 shadow-lg'
                      : 'border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white mt-2 leading-tight">
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Title & Timing Settings */}
        <div className="space-y-4 bg-slate-850 p-6 rounded-2xl border border-slate-800">
          <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">
              2
            </span>
            Titolo o Testo della Domanda:
          </label>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Qual è la capitale dell'Italia? oppure Risolvi l'indovinello..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Time selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Tempo a disposizione:
                </span>
                <span className="text-xs font-black text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-750">
                  {timeLimit}s {timeLimit >= 60 ? `(${Math.floor(timeLimit / 60)}m ${timeLimit % 60 ? `${timeLimit % 60}s` : ''})` : ''}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 mb-2">
                {[15, 30, 45, 60, 90, 120].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeLimit(t)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      timeLimit === t
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>

              {/* Step +10s up to 5 minutes (300s) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={timeLimit <= 10}
                  onClick={() => setTimeLimit((prev) => Math.max(10, prev - 10))}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300 rounded-xl text-xs font-black transition-colors cursor-pointer"
                  title="Diminuisci di 10 secondi"
                >
                  -10s
                </button>
                <button
                  type="button"
                  disabled={timeLimit >= 300}
                  onClick={() => setTimeLimit((prev) => Math.min(300, prev + 10))}
                  className="flex-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                  title="Aumenta di 10 secondi fino a 5 minuti (300 secondi)"
                >
                  <span>+10 secondi</span>
                  <span className="text-[10px] text-indigo-400">(Fino a max 5 min / 300s)</span>
                </button>
              </div>
            </div>

            {/* Optional Image Support */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Immagine di supporto (Google Docs style):
              </span>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => openImagePicker('main')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  {mainImageUrl ? 'Cambia Immagine' : 'Cerca dal Web...'}
                </button>
                {mainImageUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={mainImageUrl}
                      alt="Anteprima"
                      className="w-9 h-9 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setMainImageUrl('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Rimuovi
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Type-Specific Details */}
        <div className="space-y-4 bg-slate-850 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">
                3
              </span>
              Configurazione Specifica Gioco:
            </label>
            {selectedType === 'word_builder' && (
              <button
                type="button"
                onClick={randomizeBuilderLetters}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                title="Estrai casualmente 5 consonanti e 2 vocali bilanciate"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Randomizza Lettere
              </button>
            )}
          </div>

          {/* Type 1: Multiple Choice */}
          {selectedType === 'multiple_choice' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Inserisci le opzioni e seleziona il cerchio per indicare l'UNICA risposta corretta:
              </p>
              {mcOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = mcOptions.map((o) => ({
                        ...o,
                        isCorrect: o.id === opt.id
                      }));
                      setMcOptions(next);
                    }}
                    className={`p-2.5 rounded-xl transition-all ${
                      opt.isCorrect
                        ? 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-300 shadow-md'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Segna come corretta"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    required
                    value={opt.text}
                    onChange={(e) => {
                      const next = [...mcOptions];
                      next[idx].text = e.target.value;
                      setMcOptions(next);
                    }}
                    placeholder={`Opzione ${idx + 1} ${opt.isCorrect ? '(CORRETTA)' : ''}`}
                    className={`flex-1 py-2.5 px-4 rounded-xl bg-slate-900 border text-sm text-white focus:outline-none ${
                      opt.isCorrect
                        ? 'border-emerald-500 font-bold'
                        : 'border-slate-700'
                    }`}
                  />

                  {/* Option Image Picker */}
                  <button
                    type="button"
                    onClick={() => openImagePicker(`mc-opt-${opt.id}`)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Cerca immagine dal web per questa opzione"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{opt.imageUrl ? 'Cambia Img' : '+ Immagine'}</span>
                  </button>

                  {opt.imageUrl && (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={opt.imageUrl}
                        alt="Opzione"
                        className="w-9 h-9 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...mcOptions];
                          next[idx] = { ...next[idx], imageUrl: undefined };
                          setMcOptions(next);
                        }}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                        title="Rimuovi immagine"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {mcOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setMcOptions(mcOptions.filter((o) => o.id !== opt.id))}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {mcOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setMcOptions([
                      ...mcOptions,
                      { id: `opt-${Date.now()}`, text: '', isCorrect: false }
                    ])
                  }
                  className="px-4 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Aggiungi altra opzione
                </button>
              )}
            </div>
          )}

          {/* Type 2: True / False */}
          {selectedType === 'true_false' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Qual è la risposta esatta per questa affermazione?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTfCorrect(true)}
                  className={`py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 border-2 transition-all ${
                    tfCorrect === true
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-400/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" /> VERO
                </button>
                <button
                  type="button"
                  onClick={() => setTfCorrect(false)}
                  className={`py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 border-2 transition-all ${
                    tfCorrect === false
                      ? 'border-rose-400 bg-rose-500/20 text-rose-300 ring-4 ring-rose-400/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" /> FALSO
                </button>
              </div>
            </div>
          )}

          {/* Type 3: Open Short */}
          {selectedType === 'open_short' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Inserisci le risposte considerate valide, separate da virgola (non conta maiuscole/minuscole):
              </p>
              <input
                type="text"
                required
                value={openAnswers}
                onChange={(e) => setOpenAnswers(e.target.value)}
                placeholder="Es. Roma, roma, Roma Capitale"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Type 4: Fill Blanks */}
          {selectedType === 'fill_blanks' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  1. Scrivi la frase completa:
                </span>
                <input
                  type="text"
                  value={fillSentence}
                  onChange={(e) => setFillSentence(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  placeholder="Es. Roma è la capitale d'Italia e il Colosseo è famoso nel mondo"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300 block">
                    2. Clicca sulle parole da "bucare" (puoi bucare più parole!):
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {blankItems.length} {blankItems.length === 1 ? 'parola bucata' : 'parole bucate'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  {fillSentence.split(' ').map((w, idx) => {
                    const clean = w.replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ]/g, '').toUpperCase();
                    if (!clean) return null;
                    const isBlank = blankItems.some((b) => b.correctWord.toUpperCase() === clean);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isBlank) {
                            if (blankItems.length > 1) {
                              setBlankItems(blankItems.filter((b) => b.correctWord.toUpperCase() !== clean));
                            }
                          } else {
                            setBlankItems([
                              ...blankItems,
                              {
                                id: `b-${Date.now()}-${idx}`,
                                correctWord: clean,
                                distractors: ['Distrattore 1', 'Distrattore 2', 'Distrattore 3']
                              }
                            ]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                          isBlank
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black shadow-md scale-105'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {clean} {isBlank ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tocca una o più parole per trasformarle in buchi da completare con menu a tendina.
                </p>
              </div>

              {/* Distractors for each blank item */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  3. Definisci i distrattori per ciascun buco (appariranno nel menu a discesa):
                </span>
                {blankItems.map((blank, bIdx) => (
                  <div key={blank.id} className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        Buco #{bIdx + 1}: <strong className="text-white uppercase font-mono px-2 py-0.5 bg-slate-800 rounded-lg">{blank.correctWord}</strong> (Risposta corretta)
                      </span>
                      {blankItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setBlankItems(blankItems.filter((b) => b.id !== blank.id))}
                          className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Rimuovi buco
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {blank.distractors.map((dis, dIdx) => (
                        <input
                          key={dIdx}
                          type="text"
                          required
                          value={dis}
                          onChange={(e) => {
                            const updated = [...blankItems];
                            const curDis = [...updated[bIdx].distractors];
                            curDis[dIdx] = e.target.value;
                            updated[bIdx] = { ...updated[bIdx], distractors: curDis };
                            setBlankItems(updated);
                          }}
                          placeholder={`Distrattore ${dIdx + 1}`}
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type 5: Associazione Semplice */}
          {selectedType === 'memory_match' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Definisci le 4 coppie da associare. Per ogni cella (A e B) puoi inserire solo testo, solo immagine, o entrambi:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simpleAssocPairs.map((pair, pIdx) => (
                  <div key={pair.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-black text-indigo-300 block uppercase tracking-wider">
                      Coppia #{pIdx + 1}
                    </span>

                    {/* Cella A */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">Cella A:</span>
                        <button
                          type="button"
                          onClick={() => openImagePicker(`assoc-${pIdx}-A`)}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {pair.itemA?.image ? 'Cambia Img' : '+ Cerca Img Web'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {pair.itemA?.image && (
                          <div className="relative group flex-shrink-0">
                            <img
                              src={pair.itemA.image}
                              alt="A"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...simpleAssocPairs];
                                next[pIdx] = { ...next[pIdx], itemA: { ...next[pIdx].itemA, image: '' } };
                                setSimpleAssocPairs(next);
                              }}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[9px] cursor-pointer"
                              title="Rimuovi immagine"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <input
                          type="text"
                          value={pair.itemA?.text || ''}
                          onChange={(e) => {
                            const next = [...simpleAssocPairs];
                            next[pIdx] = { ...next[pIdx], itemA: { ...next[pIdx].itemA, text: e.target.value } };
                            setSimpleAssocPairs(next);
                          }}
                          placeholder={pair.itemA?.image ? 'Testo facoltativo' : 'Testo cella A (obbligatorio se no img)'}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Cella B */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">Cella B (corrispondente):</span>
                        <button
                          type="button"
                          onClick={() => openImagePicker(`assoc-${pIdx}-B`)}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {pair.itemB?.image ? 'Cambia Img' : '+ Cerca Img Web'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {pair.itemB?.image && (
                          <div className="relative group flex-shrink-0">
                            <img
                              src={pair.itemB.image}
                              alt="B"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...simpleAssocPairs];
                                next[pIdx] = { ...next[pIdx], itemB: { ...next[pIdx].itemB, image: '' } };
                                setSimpleAssocPairs(next);
                              }}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[9px] cursor-pointer"
                              title="Rimuovi immagine"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <input
                          type="text"
                          value={pair.itemB?.text || ''}
                          onChange={(e) => {
                            const next = [...simpleAssocPairs];
                            next[pIdx] = { ...next[pIdx], itemB: { ...next[pIdx].itemB, text: e.target.value } };
                            setSimpleAssocPairs(next);
                          }}
                          placeholder={pair.itemB?.image ? 'Testo facoltativo' : 'Testo cella B (obbligatorio se no img)'}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type: Becca la Talpa (Whack-a-Mole) */}
          {selectedType === 'mole_whack' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Configura la sfida &quot;Becca la Talpa&quot;: scegli la categoria grammaticale bersaglio, il tempo di esposizione del cartellino e le dimensioni della griglia di buche.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Grammatical Category */}
                <div className="space-y-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-amber-300 block">
                    1. Categoria da colpire:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(['nomi', 'aggettivi', 'verbi', 'articoli'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setMoleCategory(cat);
                          if (!title.trim() || title.startsWith('Becca la Talpa')) {
                            setTitle(`Becca la Talpa: colpisci tutti i ${cat.toUpperCase()}!`);
                          }
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-black text-left uppercase transition-all cursor-pointer ${
                          moleCategory === cat
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Display Duration per Mole */}
                <div className="space-y-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-indigo-300 block">
                    2. Tempo esposizione talpa:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([2, 3, 4, 5, 6, 'casuale'] as const).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setMoleDuration(dur)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          moleDuration === dur
                            ? 'bg-indigo-600 text-white font-black shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {dur === 'casuale' ? '🎲 Casuale' : `${dur} secondi`}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="font-bold text-slate-300">Dimensioni campo:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black">
                      Griglia 3x3 (9 buche)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Type 6: Draw Vote */}
          {selectedType === 'draw_vote' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Stimolazione per il disegno: cosa devono disegnare i tuoi compagni?
              </p>
              <input
                type="text"
                required
                value={drawPrompt}
                onChange={(e) => setDrawPrompt(e.target.value)}
                placeholder="Es. Il Colosseo di notte, Un robot che cucina la pizza..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
          )}

          {/* Type 7: Cell Identify */}
          {selectedType === 'cell_identify' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  Stimolazione (es. NAPOLEONE):
                </span>
                <input
                  type="text"
                  required
                  value={cellStimulus}
                  onChange={(e) => setCellStimulus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  Celle informative (spunta quelle collegate/vere):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {identifyCells.map((cell, idx) => (
                    <div
                      key={cell.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        cell.isMatch
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-800 bg-slate-900'
                      }`}
                    >
                      <input
                        type="text"
                        value={cell.text}
                        onChange={(e) => {
                          const next = [...identifyCells];
                          next[idx].text = e.target.value;
                          setIdentifyCells(next);
                        }}
                        className="bg-transparent border-none text-xs text-white focus:outline-none flex-1"
                      />
                      <input
                        type="checkbox"
                        checked={cell.isMatch}
                        onChange={(e) => {
                          const next = [...identifyCells];
                          next[idx].isMatch = e.target.checked;
                          setIdentifyCells(next);
                        }}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        title="Vero / Falso"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Type 8: Order Cells */}
          {selectedType === 'order_cells' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Inserisci le celle nell'ordine CORRETTO (verranno mescolate al giocatore). Puoi inserire testo, immagini dal web o entrambi:
                </p>
                {orderItems.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = `ord-${Date.now()}`;
                      setOrderItems([...orderItems, { id: nextId, text: `Elemento ${orderItems.length + 1}`, image: '' }]);
                    }}
                    className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Aggiungi Cella
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orderItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">
                          {idx + 1}°
                        </span>
                        <span className="text-xs font-bold text-slate-300">Posizione {idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openImagePicker(`order-${idx}`)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          {item.image ? 'Cambia Img' : '+ Img Web (Pixabay)'}
                        </button>
                        {orderItems.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderItems(orderItems.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer text-xs"
                            title="Rimuovi cella"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <div className="relative group shrink-0">
                          <img
                            src={item.image}
                            alt={`Img ${idx + 1}`}
                            className="w-14 h-14 object-cover rounded-xl border border-slate-700 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...orderItems];
                              next[idx] = { ...next[idx], image: '' };
                              setOrderItems(next);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer shadow"
                            title="Rimuovi immagine"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const next = [...orderItems];
                          next[idx] = { ...next[idx], text: e.target.value };
                          setOrderItems(next);
                        }}
                        placeholder={item.image ? 'Testo o didascalia (facoltativo)' : 'Testo della cella'}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type 9: Anagram */}
          {selectedType === 'anagram' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Inserisci la parola o frase segreta. Il computer creerà le tessere e le mescolerà:
              </p>
              <input
                type="text"
                required
                value={anagramWord}
                onChange={(e) => setAnagramWord(e.target.value.toUpperCase())}
                placeholder="Es. PLANISFERO, DANTE, ASTRONOMIA"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-black tracking-widest text-white uppercase"
              />
            </div>
          )}

          {/* Type 10: Puzzle */}
          {selectedType === 'puzzle' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={puzzleImage}
                  alt="Puzzle"
                  className="w-24 h-24 object-cover rounded-xl border border-slate-700"
                />
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => openImagePicker('puzzle')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-indigo-300 rounded-xl border border-indigo-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Scegli Immagine Puzzle (Pixabay HD)
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-bold">Griglia tessere:</span>
                    <button
                      type="button"
                      onClick={() => setPuzzleGridSize(2)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        puzzleGridSize === 2
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      2x2 (4 pezzi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPuzzleGridSize(3)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        puzzleGridSize === 3
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      3x3 (9 pezzi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPuzzleGridSize(4)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        puzzleGridSize === 4
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      4x4 (16 pezzi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPuzzleGridSize(5)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        puzzleGridSize === 5
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      5x5 (25 pezzi)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Type 11: Word Search */}
          {selectedType === 'word_search' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Inserisci le parole da nascondere nella griglia, separate da virgola (3-5 parole consigliate):
              </p>
              <input
                type="text"
                required
                value={wordSearchList}
                onChange={(e) => setWordSearchList(e.target.value.toUpperCase())}
                placeholder="Es. ROMA, SOLE, MARE, LUNA"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white uppercase"
              />
            </div>
          )}

          {/* Type 12: Math Challenge */}
          {selectedType === 'math_challenge' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Configura i parametri del generatore matematico automatico:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Operators */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Operazioni:</span>
                  <div className="flex gap-1">
                    {(['+', '-', '*', '/'] as const).map((op) => {
                      const active = mathOps.includes(op);
                      return (
                        <button
                          key={op}
                          type="button"
                          onClick={() => {
                            if (active && mathOps.length > 1) {
                              setMathOps(mathOps.filter((o) => o !== op));
                            } else if (!active) {
                              setMathOps([...mathOps, op]);
                            }
                          }}
                          className={`w-9 h-9 rounded-lg font-black text-sm ${
                            active
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {op === '*' ? '×' : op === '/' ? ':' : op}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Operations Count */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">N° Esercizi:</span>
                  <div className="flex gap-1">
                    {([1, 2, 3, 4] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setMathCount(cnt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black ${
                          mathCount === cnt
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limit */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Entro il:</span>
                  <div className="flex gap-1">
                    {([10, 100, 1000] as const).map((rng) => (
                      <button
                        key={rng}
                        type="button"
                        onClick={() => setMathRange(rng)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black ${
                          mathRange === rng
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {rng}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carry/Remainder toggle */}
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={mathCarry}
                      onChange={(e) => setMathCarry(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500"
                    />
                    Con riporto / resto
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Type 13: Word Builder */}
          {selectedType === 'word_builder' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Configura le 5 consonanti e 2 vocali con cui formare le parole:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Consonanti:</span>
                {builderConsonants.map((c, i) => (
                  <input
                    key={`c-${i}`}
                    type="text"
                    maxLength={1}
                    value={c}
                    onChange={(e) => {
                      const next = [...builderConsonants];
                      next[i] = e.target.value.toUpperCase();
                      setBuilderConsonants(next);
                    }}
                    className="w-10 h-10 text-center font-black text-lg bg-slate-900 border border-slate-700 rounded-lg text-white uppercase"
                  />
                ))}

                <span className="text-xs font-bold text-slate-400 ml-4">Vocali:</span>
                {builderVowels.map((v, i) => (
                  <input
                    key={`v-${i}`}
                    type="text"
                    maxLength={1}
                    value={v}
                    onChange={(e) => {
                      const next = [...builderVowels];
                      next[i] = e.target.value.toUpperCase();
                      setBuilderVowels(next);
                    }}
                    className="w-10 h-10 text-center font-black text-lg bg-slate-900 border border-amber-500/50 rounded-lg text-amber-300 uppercase"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Type 14: La Parola Più Lunga */}
          {selectedType === 'longest_word' && (
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-fuchsia-500/40">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-fuchsia-400" />
                    Configura le 10 consonanti e 4 vocali
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gli studenti useranno queste 14 lettere per comporre la parola valida più lunga possibile. Chi trova la più lunga vince +25 punti extra!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={randomizeLongestLetters}
                  className="px-3 py-1.5 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Estrai casualmente lettere bilanciate"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Estrai Casuali
                </button>
              </div>

              {/* 10 Consonants Inputs */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1.5">
                  10 Consonanti (modifica le singole lettere se desideri):
                </span>
                <div className="flex flex-wrap gap-2">
                  {longestConsonants.map((c, i) => (
                    <input
                      key={`lc-${i}`}
                      type="text"
                      maxLength={1}
                      value={c}
                      onChange={(e) => {
                        const next = [...longestConsonants];
                        next[i] = e.target.value.toUpperCase();
                        setLongestConsonants(next);
                      }}
                      className="w-10 h-10 text-center font-black text-lg bg-slate-950 border border-indigo-500/50 rounded-xl text-white uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* 4 Vowels Inputs */}
              <div>
                <span className="text-xs font-bold text-amber-400 block mb-1.5">
                  4 Vocali (modifica le singole lettere se desideri):
                </span>
                <div className="flex flex-wrap gap-2">
                  {longestVowels.map((v, i) => (
                    <input
                      key={`lv-${i}`}
                      type="text"
                      maxLength={1}
                      value={v}
                      onChange={(e) => {
                        const next = [...longestVowels];
                        next[i] = e.target.value.toUpperCase();
                        setLongestVowels(next);
                      }}
                      className="w-10 h-10 text-center font-black text-lg bg-slate-950 border border-amber-500/60 rounded-xl text-amber-300 uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-sm transition-colors"
            >
              Annulla
            </button>
          )}

          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base shadow-xl flex items-center gap-2 transition-transform active:scale-98"
          >
            <Send className="w-5 h-5" />
            Invia Domanda al Repository Docente
          </button>
        </div>
      </form>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={handleImagePicked}
      />
    </div>
  );
};
