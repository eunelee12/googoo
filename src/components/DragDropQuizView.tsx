import React, { useState, useEffect } from 'react';
import { Question, SessionResult } from '../types';
import { sounds } from '../utils/audio';
import { triggerCorrectFireworks } from '../utils/confetti';
import { TUTOR, getRandomPraise, getRandomEncourage } from '../data/tutor';

interface DragDropQuizViewProps {
  questions: Question[];
  selectedDan?: number;
  onFinishQuiz: (result: SessionResult) => void;
  onQuitQuiz: () => void;
}

interface AnswerCard {
  id: string;
  value: number;
  isMatched: boolean;
}

export const DragDropQuizView: React.FC<DragDropQuizViewProps> = ({
  questions,
  selectedDan,
  onFinishQuiz,
  onQuitQuiz,
}) => {
  const [startTime] = useState<number>(Date.now());
  const [matchedQuestions, setMatchedQuestions] = useState<Record<string, number>>({}); // qId -> userAnswer
  const [answerCards, setAnswerCards] = useState<AnswerCard[]>([]);
  
  // Selection state for click-to-match (touch/mouse friendly)
  const [selectedAnswerCard, setSelectedAnswerCard] = useState<AnswerCard | null>(null);
  const [draggedAnswerCard, setDraggedAnswerCard] = useState<AnswerCard | null>(null);

  // Feedback state
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | null;
    message: string;
    targetQId?: string;
  }>({ type: null, message: '' });

  // Wrong attempts tracker per question
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});

  // Initialize answer cards shuffled on mount
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const cards: AnswerCard[] = questions.map((q, idx) => ({
      id: `ans_${idx}_${q.answer}_${Math.random()}`,
      value: q.answer,
      isMatched: false,
    }));

    // Shuffle answer cards randomly
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setAnswerCards(shuffled);
  }, [questions]);

  const matchedCount = Object.keys(matchedQuestions).length;

  // Handle matching attempt (either drag-drop or click-select)
  const handleTryMatch = (question: Question, card: AnswerCard) => {
    if (matchedQuestions[question.id]) return; // Already matched

    if (card.value === question.answer) {
      // Correct Match!
      sounds.playCorrect();
      triggerCorrectFireworks();

      const newMatched = { ...matchedQuestions, [question.id]: card.value };
      setMatchedQuestions(newMatched);

      // Mark answer card as matched
      setAnswerCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isMatched: true } : c))
      );

      setSelectedAnswerCard(null);
      setDraggedAnswerCard(null);

      const praise = getRandomPraise();
      setFeedback({
        type: 'correct',
        message: `${praise} (${question.num1} × ${question.num2} = ${card.value})`,
        targetQId: question.id,
      });

      // Check if all 10 problems are completed!
      if (Object.keys(newMatched).length === questions.length) {
        setTimeout(() => {
          handleWrapUp(newMatched);
        }, 1200);
      }
    } else {
      // Incorrect Match!
      sounds.playIncorrect();

      setWrongAttempts((prev) => ({
        ...prev,
        [question.id]: (prev[question.id] || 0) + 1,
      }));

      setSelectedAnswerCard(null);
      setDraggedAnswerCard(null);

      const encourage = getRandomEncourage();
      setFeedback({
        type: 'incorrect',
        message: `${encourage} (${question.num1} × ${question.num2} 은(는) ${card.value}가 아니에요!)`,
        targetQId: question.id,
      });
    }
  };

  // Wrap up session
  const handleWrapUp = (finalMatched: Record<string, number>) => {
    const durationSec = Math.round((Date.now() - startTime) / 1000);
    
    // Calculate questions status
    const processedQuestions: Question[] = questions.map((q) => {
      const userAns = finalMatched[q.id];
      const mistakes = wrongAttempts[q.id] || 0;
      const isCorrect = userAns === q.answer && mistakes === 0;
      return {
        ...q,
        userAnswer: userAns,
        isCorrect: isCorrect,
        timeTakenSec: Math.round(durationSec / questions.length),
      };
    });

    const perfectCount = processedQuestions.filter((q) => q.isCorrect).length;
    const score = Math.round((perfectCount / questions.length) * 100);

    const result: SessionResult = {
      id: `s_${Date.now()}`,
      timestamp: Date.now(),
      mode: 'dragdrop',
      selectedDan: selectedDan,
      totalQuestions: questions.length,
      correctCount: perfectCount,
      score: score,
      durationSec: durationSec,
      questions: processedQuestions,
    };

    onFinishQuiz(result);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3 w-full py-1 flex flex-col min-h-0">
      {/* Top Header Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border-3 sm:border-4 border-yellow-300 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 font-jua text-slate-800 text-sm sm:text-base">
          <span className="btn-vibrant-pink px-2.5 py-0.5 rounded-lg text-xs font-bold border border-pink-700">
            🧩 답찾기 드래그 & 드롭 ({matchedCount} / {questions.length})
          </span>
          <span className="text-xs text-blue-600 font-sans font-black hidden sm:inline">
            문제와 답을 마우스로 드래그하여 맞혀보세요!
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onQuitQuiz();
          }}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
        >
          그만하기
        </button>
      </div>

      {/* Tutor Banner */}
      <div className="bg-yellow-50 p-2 sm:p-2.5 rounded-xl border border-yellow-300 flex items-center gap-2 text-left">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-lg border border-pink-400 flex items-center justify-center text-lg sm:text-2xl shrink-0">
          {TUTOR.avatar}
        </div>
        <div className="flex-1 font-gaegu text-sm sm:text-lg text-slate-800 font-bold leading-tight truncate">
          {feedback.type === 'correct' ? (
            <span className="text-emerald-600 font-extrabold">{feedback.message}</span>
          ) : feedback.type === 'incorrect' ? (
            <span className="text-rose-600 font-extrabold">{feedback.message}</span>
          ) : selectedAnswerCard ? (
            <span className="text-blue-600 font-bold">
              선택한 답 [{selectedAnswerCard.value}]을(를) 매칭할 구구단 문제를 클릭하거나 드롭하세요!
            </span>
          ) : (
            <span>"오른쪽 [답 숫자]를 드래그해서 왼쪽 [구구단 문제] 위로 놓아보세요!"</span>
          )}
        </div>
      </div>

      {/* Grid Layout: Left Problems vs Right Answer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Left: 10 Multiplication Problems */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-3 border-blue-200 shadow-sm flex flex-col space-y-1.5 overflow-y-auto">
          <div className="font-jua text-xs text-blue-600 flex items-center justify-between border-b border-blue-100 pb-1">
            <span>❓ 구구단 문제 (드롭 영역)</span>
            <span className="text-[10px] text-slate-400 font-sans">10문제</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 flex-1">
            {questions.map((q) => {
              const isMatched = !!matchedQuestions[q.id];
              const matchedVal = matchedQuestions[q.id];
              const isTargeting = feedback.targetQId === q.id;

              return (
                <div
                  key={q.id}
                  onDragOver={(e) => {
                    e.preventDefault(); // allow drop
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedAnswerCard) {
                      handleTryMatch(q, draggedAnswerCard);
                    }
                  }}
                  onClick={() => {
                    if (selectedAnswerCard && !isMatched) {
                      handleTryMatch(q, selectedAnswerCard);
                    }
                  }}
                  className={`p-2 rounded-xl border-2 transition-all flex items-center justify-between font-jua text-sm sm:text-base cursor-pointer relative ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                      : selectedAnswerCard
                      ? 'bg-blue-50/80 border-blue-400 hover:bg-blue-100 animate-pulse'
                      : isTargeting && feedback.type === 'incorrect'
                      ? 'bg-rose-50 border-rose-400 animate-shake'
                      : 'bg-slate-50 border-slate-200 hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-slate-800">
                      {q.num1} × {q.num2} =
                    </span>
                    {isMatched ? (
                      <span className="text-emerald-700 font-black text-lg underline">
                        {matchedVal}
                      </span>
                    ) : (
                      <span className="text-pink-400 font-bold">?</span>
                    )}
                  </div>

                  <div>
                    {isMatched ? (
                      <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                        ✅ 완벽
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-sans">
                        [드롭]
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 10 Answer Cards */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-3 border-pink-200 shadow-sm flex flex-col space-y-1.5 overflow-y-auto">
          <div className="font-jua text-xs text-pink-600 flex items-center justify-between border-b border-pink-100 pb-1">
            <span>🎯 답 숫자 카드 (드래그 대상)</span>
            <span className="text-[10px] text-slate-400 font-sans">버튼 클릭 및 드래그 가능</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 flex-1">
            {answerCards.map((card) => {
              const isSelected = selectedAnswerCard?.id === card.id;

              return (
                <button
                  key={card.id}
                  disabled={card.isMatched}
                  draggable={!card.isMatched}
                  onDragStart={() => {
                    if (!card.isMatched) {
                      setDraggedAnswerCard(card);
                      setSelectedAnswerCard(card);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggedAnswerCard(null);
                  }}
                  onClick={() => {
                    if (card.isMatched) return;
                    sounds.playClick();
                    if (selectedAnswerCard?.id === card.id) {
                      setSelectedAnswerCard(null);
                    } else {
                      setSelectedAnswerCard(card);
                    }
                  }}
                  className={`p-2.5 rounded-xl border-2 font-jua text-lg sm:text-xl transition-all cursor-grab active:cursor-grabbing flex items-center justify-center gap-1 shadow-xs ${
                    card.isMatched
                      ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed line-through'
                      : isSelected
                      ? 'btn-vibrant-pink border-2 border-pink-700 scale-105 ring-2 ring-pink-400'
                      : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-slate-800'
                  }`}
                >
                  <span>숫자</span>
                  <span className="font-black text-pink-600 text-2xl ml-1">{card.value}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
