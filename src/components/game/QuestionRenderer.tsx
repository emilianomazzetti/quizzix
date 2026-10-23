import React, { Suspense } from 'react';
import { lazyNamed } from '../../utils/lazyNamed';
import {
  Question,
  MultipleChoiceContent,
  TrueFalseContent,
  OpenShortContent,
  FillBlanksContent,
  MemoryMatchContent,
  DrawVoteContent,
  CellIdentifyContent,
  OrderCellsContent,
  AnagramContent,
  PuzzleContent,
  WordSearchContent,
  MathChallengeContent,
  WordBuilderContent,
  MoleWhackContent,
  LongestWordContent,
  DrawingSubmission
} from '../../types/quiz';
const MultipleChoicePlayer = lazyNamed(() => import('./MultipleChoicePlayer'), 'MultipleChoicePlayer');
const TrueFalsePlayer = lazyNamed(() => import('./TrueFalsePlayer'), 'TrueFalsePlayer');
const OpenShortPlayer = lazyNamed(() => import('./OpenShortPlayer'), 'OpenShortPlayer');
const FillBlanksPlayer = lazyNamed(() => import('./FillBlanksPlayer'), 'FillBlanksPlayer');
const MemoryMatchPlayer = lazyNamed(() => import('./MemoryMatchPlayer'), 'MemoryMatchPlayer');
const DrawVotePlayer = lazyNamed(() => import('./DrawVotePlayer'), 'DrawVotePlayer');
const CellIdentifyPlayer = lazyNamed(() => import('./CellIdentifyPlayer'), 'CellIdentifyPlayer');
const OrderCellsPlayer = lazyNamed(() => import('./OrderCellsPlayer'), 'OrderCellsPlayer');
const AnagramPlayer = lazyNamed(() => import('./AnagramPlayer'), 'AnagramPlayer');
const PuzzlePlayer = lazyNamed(() => import('./PuzzlePlayer'), 'PuzzlePlayer');
const WordSearchPlayer = lazyNamed(() => import('./WordSearchPlayer'), 'WordSearchPlayer');
const MathChallengePlayer = lazyNamed(() => import('./MathChallengePlayer'), 'MathChallengePlayer');
const WordBuilderPlayer = lazyNamed(() => import('./WordBuilderPlayer'), 'WordBuilderPlayer');
const WhackMolePlayer = lazyNamed(() => import('./WhackMolePlayer'), 'WhackMolePlayer');
const LongestWordPlayer = lazyNamed(() => import('./LongestWordPlayer'), 'LongestWordPlayer');

interface QuestionRendererProps {
  question: Question;
  onAnswer: (isCorrect: boolean, payload?: any) => void;
  disabled?: boolean;
  myPlayerId?: string;
  drawings?: Record<string, DrawingSubmission>;
  isGalleryMode?: boolean;
  onSaveDrawing?: (dataUrl: string) => void;
  onVoteDrawing?: (targetPlayerId: string) => void;
}

const QuestionRendererInner: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  disabled = false,
  myPlayerId = '',
  drawings = {},
  isGalleryMode = false,
  onSaveDrawing = () => {},
  onVoteDrawing = () => {}
}) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <MultipleChoicePlayer
          key={question.id}
          content={question.content as MultipleChoiceContent}
          imageUrl={question.imageUrl}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'true_false':
      return (
        <TrueFalsePlayer
          key={question.id}
          content={question.content as TrueFalseContent}
          imageUrl={question.imageUrl}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'open_short':
      return (
        <OpenShortPlayer
          key={question.id}
          content={question.content as OpenShortContent}
          imageUrl={question.imageUrl}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'fill_blanks':
      return (
        <FillBlanksPlayer
          key={question.id}
          content={question.content as FillBlanksContent}
          imageUrl={question.imageUrl}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'memory_match':
      return (
        <MemoryMatchPlayer
          key={question.id}
          content={question.content as MemoryMatchContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'draw_vote':
      return (
        <DrawVotePlayer
          key={`${question.id}-${isGalleryMode ? 'gallery' : 'draw'}`}
          content={question.content as DrawVoteContent}
          myPlayerId={myPlayerId}
          drawings={drawings}
          isGalleryMode={isGalleryMode}
          onSaveDrawing={onSaveDrawing}
          onVoteDrawing={onVoteDrawing}
          disabled={disabled}
        />
      );

    case 'cell_identify':
      return (
        <CellIdentifyPlayer
          key={question.id}
          content={question.content as CellIdentifyContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'order_cells':
      return (
        <OrderCellsPlayer
          key={question.id}
          content={question.content as OrderCellsContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'anagram':
      return (
        <AnagramPlayer
          key={question.id}
          content={question.content as AnagramContent}
          imageUrl={question.imageUrl}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'puzzle':
      return (
        <PuzzlePlayer
          key={question.id}
          content={question.content as PuzzleContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'word_search':
      return (
        <WordSearchPlayer
          key={question.id}
          content={question.content as WordSearchContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'math_challenge':
      return (
        <MathChallengePlayer
          key={question.id}
          content={question.content as MathChallengeContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'word_builder':
      return (
        <WordBuilderPlayer
          key={question.id}
          content={question.content as WordBuilderContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'mole_whack':
      return (
        <WhackMolePlayer
          key={question.id}
          content={question.content as MoleWhackContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case 'longest_word':
      return (
        <LongestWordPlayer
          key={question.id}
          content={question.content as LongestWordContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="p-6 text-center text-slate-400">
          Tipologia di domanda non riconosciuta.
        </div>
      );
  }
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = (props) => (
  <Suspense
    fallback={<div className="p-6 text-center text-slate-400">Caricamento attività…</div>}
  >
    <QuestionRendererInner {...props} />
  </Suspense>
);
