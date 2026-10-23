/**
 * FlipQuiz Data Models and Types
 * Pedagogical collaborative quiz system inspired by PanQuiz & Flipped Classroom.
 */

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'open_short'
  | 'fill_blanks'
  | 'memory_match'
  | 'draw_vote'
  | 'cell_identify'
  | 'order_cells'
  | 'anagram'
  | 'puzzle'
  | 'word_search'
  | 'math_challenge'
  | 'word_builder'
  | 'mole_whack'
  | 'longest_word';

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  imageUrl?: string;
}

export interface MultipleChoiceContent {
  options: MultipleChoiceOption[];
}

export interface TrueFalseContent {
  isTrueCorrect: boolean;
}

export interface OpenShortContent {
  acceptedAnswers: string[]; // e.g. ["Roma", "roma"]
}

export interface BlankItem {
  id: string;
  correctWord: string;
  distractors: string[];
}

export interface FillBlanksContent {
  originalText: string;
  blankWord?: string; // backwards compatibility for single blank
  distractors?: string[]; // backwards compatibility for single blank
  blanks?: BlankItem[]; // support for 1 or more custom blanks with choices
}

export interface AssociationCell {
  text?: string;
  image?: string;
}

export interface AssociationPair {
  id: string;
  itemA: AssociationCell;
  itemB: AssociationCell;
  // Backwards compatibility with previous MemoryMatch
  image?: string;
  text?: string;
}

export interface SimpleAssociationContent {
  pairs: AssociationPair[];
}

export type MemoryMatchContent = SimpleAssociationContent;

export interface DrawVoteContent {
  prompt: string;
}

export interface CellIdentifyContent {
  stimulus: string; // e.g. "NAPOLEONE"
  cells: { id: string; text: string; isMatch: boolean; image?: string }[];
}

export interface OrderCellsContent {
  correctOrder: { id: string; text: string; image?: string }[];
}

export interface AnagramContent {
  phraseOrWord: string;
}

export interface PuzzleContent {
  imageUrl: string;
  gridSize: 2 | 3 | 4 | 5; // 2x2, 3x3, 4x4, 5x5
}

export interface WordSearchContent {
  words: string[];
  gridSize: number; // e.g. 8x8 or 10x10
}

export interface MathChallengeContent {
  operators: ('+' | '-' | '*' | '/')[];
  numberOfOperations: 1 | 2 | 3 | 4;
  digitRange: 10 | 100 | 1000;
  allowCarryOrRemainder: boolean;
  generatedProblems?: { equation: string; answer: number }[];
}

export interface WordBuilderContent {
  consonants: string[]; // 5 consonants
  vowels: string[]; // 2 vowels
}

export interface MoleWhackContent {
  category: 'nomi' | 'aggettivi' | 'verbi' | 'articoli';
  duration: 2 | 3 | 4 | 5 | 6 | 'casuale';
  gridSize: 3 | 4; // 3x3 (9 buche) o 4x4 (16 buche)
}

export interface LongestWordContent {
  consonants: string[]; // 10 consonants chosen by creator
  vowels: string[];     // 4 vowels chosen by creator
}

export type QuestionContent =
  | MultipleChoiceContent
  | TrueFalseContent
  | OpenShortContent
  | FillBlanksContent
  | SimpleAssociationContent
  | DrawVoteContent
  | CellIdentifyContent
  | OrderCellsContent
  | AnagramContent
  | PuzzleContent
  | WordSearchContent
  | MathChallengeContent
  | WordBuilderContent
  | MoleWhackContent
  | LongestWordContent;

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  creatorName: string;
  timeLimit: number; // 10, 25, 40, 60 seconds
  points: number; // default 50
  imageUrl?: string;
  content: QuestionContent;
  createdAt: number;
  approved: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  avatar: string;
  isSimulated?: boolean;
}

export interface AnswerSubmission {
  playerId: string;
  playerName: string;
  submittedAt: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  pointsAwarded: number;
  speedRank?: number; // 1, 2, 3
  answerPayload?: any;
}

export interface DrawingSubmission {
  playerId: string;
  playerName: string;
  dataUrl: string;
  votes: string[]; // array of playerIds who gave a star
}

export type GamePhase =
  | 'lobby'             // Students entering, waiting for teacher
  | 'creation'          // Students creating questions from their devices
  | 'repository_review' // Teacher reviewing / curating questions before launch
  | 'question_intro'    // 3s splash: "Domanda di [Marco]!"
  | 'question_active'   // Timed interactive play
  | 'question_results'  // Correct answer + fast fingers podium
  | 'draw_gallery'      // For drawing question: gallery & star voting
  | 'leaderboard'       // Standings after turn
  | 'podium';           // Final game over podium

export interface RoomSettings {
  basePoints: number;
  fastFingerBonus1: number;
  fastFingerBonus2: number;
  fastFingerBonus3: number;
  defaultTimeLimit: number;
  soundEnabled: boolean;
}

export interface RoomState {
  roomCode: string;
  roomName: string;
  phase: GamePhase;
  currentQuestionIndex: number;
  questions: Question[];
  players: Record<string, Player>;
  answersThisTurn: Record<string, AnswerSubmission>;
  drawingsThisTurn: Record<string, DrawingSubmission>;
  turnStartTime: number;
  turnDuration: number;
  settings: RoomSettings;
  resetEpoch?: number;
  kickedPlayerIds?: string[];
}
