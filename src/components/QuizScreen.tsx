import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, QuizMode, SessionResult } from '../types';
import { triggerCorrectFireworks } from '../utils/confetti';
import { sounds } from '../utils/audio';
import { TUTOR, getRandomPraise, getRandomEncourage, getVisualExplanation } from '../data/tutor';
import { DragDropQuizView } from './DragDropQuizView';

interface QuizScreenProps {
  mode: QuizMode;
  selectedDan?: number;
  weaknessMap: Record<string, number>;
  onFinishQuiz: (result: SessionResult) => void;
  onQuitQuiz: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  mode,
  selectedDan,
  weaknessMap,
  onFinishQuiz,
  onQuitQuiz,
}) => {
  // Generate 10 questions for this session
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | null;
    message: string;
    num1?: number;
    num2?: number;
    answer?: number;
  }>({ type: null, message: '' });

  const [showVisualHint, setShowVisualHint] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(10); // for speed mode
  const [startTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Generate 10 questions on mount
  useEffect(() => {
    const generated: Question[] = [];

    if (mode === 'weakness' && Object.keys(weaknessMap).length > 0) {
      // Pick weak problems first
      const weakKeys = Object.keys(weaknessMap);
      for (let i = 0; i < 10; i++) {
        const randomKey = weakKeys[i % weakKeys.length];
        const [n1, n2] = randomKey.split('x').map(Number);
        generated.push({
          id: `q_${i}_${Date.now()}`,
          num1: n1,
          num2: n2,
          answer: n1 * n2,
        });
      }
    } else if (selectedDan !== undefined && selectedDan !== 11) {
      // Specific Dan (2~9)
      const multiplierList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      // Shuffle multiplierList to vary question sequence
      const shuffled = [...multiplierList].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 10; i++) {
        const num2 = shuffled[i % 9];
        generated.push({
          id: `q_${i}_${Date.now()}`,
          num1: selectedDan,
          num2: num2,
          answer: selectedDan * num2,
        });
      }
    } else if (selectedDan === 11) {
      // Challenge 11~19 Dan
      for (let i = 0; i < 10; i++) {
        const n1 = Math.floor(Math.random() * 9) + 11; // 11~19
        const n2 = Math.floor(Math.random() * 9) + 1;  // 1~9
        generated.push({
          id: `q_${i}_${Date.now()}`,
          num1: n1,
          num2: n2,
          answer: n1 * n2,
        });
      }
    } else {
      // Mixed all 2~9 Dan
      for (let i = 0; i < 10; i++) {
        const n1 = Math.floor(Math.random() * 8) + 2; // 2~9
        const n2 = Math.floor(Math.random() * 9) + 1; // 1~9
        generated.push({
          id: `q_${i}_${Date.now()}`,
          num1: n1,
          num2: n2,
          answer: n1 * n2,
        });
      }
    }

    setQuestions(generated);
    setQuestionStartTime(Date.now());
  }, [mode, selectedDan, weaknessMap]);

  const currentQ = questions[currentIndex];

  // Timer interval for timeattack mode
  useEffect(() => {
    if (mode !== 'timeattack' || feedback.type !== null || !currentQ) return;

    setTimerSeconds(10);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, mode, feedback.type, currentQ]);

  // Handle timeout in timeattack mode
  const handleTimeOut = useCallback(() => {
    if (!currentQ || feedback.type !== null) return;

    sounds.playIncorrect();
    const praiseOrEncourage = getRandomEncourage();

    // Mark question as incorrect
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex
          ? {
              ...q,
              userAnswer: -1,
              isCorrect: false,
              timeTakenSec: 10,
            }
          : q
      )
    );

    setFeedback({
      type: 'incorrect',
      message: `시간 초과! ⏰ 정답은 ${currentQ.answer} 이었어!`,
      num1: currentQ.num1,
      num2: currentQ.num2,
      answer: currentQ.answer,
    });
  }, [currentQ, currentIndex, feedback.type]);

  // Keypad / Typing handlers
  const handleNumClick = (digit: string) => {
    if (feedback.type !== null) return;
    sounds.playClick();
    if (inputVal.length < 3) {
      setInputVal((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    if (feedback.type !== null) return;
    sounds.playClick();
    setInputVal('');
  };

  const handleSubmit = () => {
    if (feedback.type !== null || !currentQ || inputVal === '') return;

    const userAns = parseInt(inputVal, 10);
    const isCorrect = userAns === currentQ.answer;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);

    // Save answer in questions state
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex
          ? {
              ...q,
              userAnswer: userAns,
              isCorrect: isCorrect,
              timeTakenSec: timeTaken,
            }
          : q
      )
    );

    if (isCorrect) {
      sounds.playCorrect();
      triggerCorrectFireworks(); // Fireworks & Confetti celebration!
      const praise = getRandomPraise();
      setFeedback({
        type: 'correct',
        message: `${praise} (${currentQ.num1} × ${currentQ.num2} = ${currentQ.answer})`,
        num1: currentQ.num1,
        num2: currentQ.num2,
        answer: currentQ.answer,
      });
    } else {
      sounds.playIncorrect();
      const encourage = getRandomEncourage();
      setFeedback({
        type: 'incorrect',
        message: `${encourage} (정답은 ${currentQ.answer} 이었어요!)`,
        num1: currentQ.num1,
        num2: currentQ.num2,
        answer: currentQ.answer,
      });
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showVisualHint) return;
      if (e.key >= '0' && e.key <= '9') {
        handleNumClick(e.key);
      } else if (e.key === 'Backspace') {
        handleClear();
      } else if (e.key === 'Enter') {
        if (feedback.type !== null) {
          handleNextQuestion();
        } else {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputVal, feedback.type, showVisualHint, currentQ]);

  // Advance to next question or show final results
  const handleNextQuestion = () => {
    sounds.playClick();
    setShowVisualHint(false);
    setInputVal('');
    setFeedback({ type: null, message: '' });

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // 10 questions completed! Wrap up session
      const totalDurationSec = Math.round((Date.now() - startTime) / 1000);
      const correctCount = questions.filter((q) => q.isCorrect).length;
      const score = Math.round((correctCount / questions.length) * 100);

      const sessionResult: SessionResult = {
        id: `s_${Date.now()}`,
        timestamp: Date.now(),
        mode: mode,
        selectedDan: selectedDan,
        totalQuestions: questions.length,
        correctCount: correctCount,
        score: score,
        durationSec: totalDurationSec,
        questions: questions,
      };

      onFinishQuiz(sessionResult);
    }
  };

  if (mode === 'dragdrop') {
    return (
      <DragDropQuizView
        questions={questions}
        selectedDan={selectedDan}
        onFinishQuiz={onFinishQuiz}
        onQuitQuiz={onQuitQuiz}
      />
    );
  }

  if (!currentQ) {
    return (
      <div className="text-center py-12 font-jua text-amber-900 text-xl">
        문제를 만드는 중이에요... 🎨
      </div>
    );
  }

  const visualExp = getVisualExplanation(currentQ.num1, currentQ.num2);

  return (
    <div className="max-w-xl mx-auto space-y-2 sm:space-y-3 my-auto w-full flex flex-col justify-between py-1">
      {/* Quiz Progress & Timer Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border-3 sm:border-4 border-yellow-300 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 font-jua text-slate-800 text-sm sm:text-lg">
          <span className="btn-vibrant-pink px-2.5 py-0.5 rounded-lg sm:rounded-xl text-xs sm:text-sm border border-pink-700 font-bold">
            문제 {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-blue-600 font-sans font-black hidden sm:inline">
            {mode === 'timeattack' ? '⚡ 스피드 타임어택' : selectedDan ? `${selectedDan}단 연습` : '🌈 전체 혼합'}
          </span>
        </div>

        {/* Speed Mode Countdown Timer */}
        {mode === 'timeattack' && (
          <div className="flex items-center gap-1.5 font-jua">
            <span className="text-xs text-slate-500">남은 시간:</span>
            <span
              className={`text-base sm:text-xl px-2 py-0.5 rounded-lg font-bold border-2 ${
                timerSeconds <= 3
                  ? 'bg-rose-500 text-white border-rose-600 animate-bounce'
                  : 'bg-yellow-100 text-yellow-900 border-yellow-300'
              }`}
            >
              ⏱️ {timerSeconds}초
            </span>
          </div>
        )}

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

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-3 sm:border-4 border-pink-300 shadow-md text-center relative overflow-hidden my-auto">
        {/* Tutor Avatar & Speech Bubble */}
        <div className="flex items-center gap-2.5 mb-2 text-left bg-yellow-50 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-yellow-300">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-pink-100 rounded-xl border border-pink-400 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            {TUTOR.avatar}
          </div>
          <div className="flex-1 font-gaegu text-base sm:text-xl text-slate-800 font-bold leading-tight">
            {feedback.type === 'correct' ? (
              <span className="text-emerald-600 font-extrabold">{feedback.message}</span>
            ) : feedback.type === 'incorrect' ? (
              <span className="text-rose-600 font-extrabold">{feedback.message}</span>
            ) : (
              <span>"{currentQ.num1} 곱하기 {currentQ.num2}는 얼마일까요? 정답을 입력해봐요!"</span>
            )}
          </div>
        </div>

        {/* Big Multiplication Expression */}
        <div className="py-3 sm:py-4 my-1 sm:my-2 bg-slate-50 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-blue-200 flex items-center justify-center gap-2 sm:gap-4 font-jua text-3xl sm:text-5xl text-slate-900">
          <span className="text-blue-600">{currentQ.num1}</span>
          <span className="text-pink-500 font-black">×</span>
          <span className="text-blue-600">{currentQ.num2}</span>
          <span className="text-pink-500 font-black">=</span>
          <div className="min-w-[70px] sm:min-w-[90px] h-12 sm:h-16 bg-white border-3 sm:border-4 border-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-pink-600 shadow-inner px-2 font-bold tracking-wider">
            {inputVal !== '' ? inputVal : <span className="text-slate-300 animate-pulse">?</span>}
          </div>
        </div>

        {/* Action button if feedback is showing */}
        {feedback.type !== null ? (
          <div className="mt-2 animate-pop">
            <button
              onClick={handleNextQuestion}
              className="w-full py-2.5 sm:py-3 px-4 btn-vibrant-blue text-white font-jua text-lg sm:text-xl rounded-xl sm:rounded-2xl border-2 border-blue-800 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{currentIndex + 1 < questions.length ? '다음 문제로! ➡️' : '결과 확인하기! 🏆'}</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-1">
            <button
              onClick={() => {
                sounds.playClick();
                setShowVisualHint(!showVisualHint);
              }}
              className="text-xs font-bold font-jua text-yellow-900 bg-yellow-200 hover:bg-yellow-300 border border-yellow-400 px-2.5 py-1 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              💡 그림 힌트 {showVisualHint ? '닫기' : '보기'}
            </button>
          </div>
        )}

        {/* Visual Explanation Modal / Dropdown */}
        {showVisualHint && (
          <div className="mt-2 p-3 bg-yellow-100/90 rounded-xl border border-yellow-300 text-left space-y-2 animate-pop max-h-36 overflow-y-auto">
            <div className="font-jua text-yellow-900 text-xs sm:text-sm flex items-center gap-1.5">
              <span>💡</span>
              <span>구구단 원리: 덧셈으로 쉽게 풀기</span>
            </div>
            <p className="text-xs text-slate-700 font-bold">
              <strong className="text-pink-600">{currentQ.num1} × {currentQ.num2}</strong>는{' '}
              <span className="underline">{currentQ.num1}</span>을{' '}
              <span className="underline">{currentQ.num2}번</span> 더한 것과 같아요!
            </p>

            <div className="bg-white p-2 rounded-lg border border-yellow-300 text-xs font-mono text-center font-bold text-slate-800">
              {visualExp.additionStr} = {visualExp.answer}
            </div>

            {/* Visual Dot Array Grid */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-bold text-slate-500">바둑알 시각 자료:</div>
              <div className="flex flex-wrap gap-1.5 justify-center bg-white p-2 rounded-lg border border-yellow-300 max-h-24 overflow-y-auto">
                {visualExp.groups.map((group, gIdx) => (
                  <div key={gIdx} className="bg-pink-50 p-1 rounded-lg border border-pink-200 flex items-center gap-1">
                    {group.map((_, iIdx) => (
                      <span key={iIdx} className="w-3.5 h-3.5 bg-pink-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-xs">
                        ⭐
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kid-Friendly On-Screen Keypad */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border-3 sm:border-4 border-blue-200 shadow-sm space-y-1.5 sm:space-y-2">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              disabled={feedback.type !== null}
              className="py-2.5 sm:py-3 bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-blue-300 text-slate-800 font-jua text-xl sm:text-2xl rounded-xl sm:rounded-2xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer font-black"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            disabled={feedback.type !== null}
            className="py-2.5 sm:py-3 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 border-2 border-rose-300 text-rose-800 font-jua text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center font-bold"
          >
            지우기 ⌫
          </button>

          <button
            onClick={() => handleNumClick('0')}
            disabled={feedback.type !== null}
            className="py-2.5 sm:py-3 bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-blue-300 text-slate-800 font-jua text-xl sm:text-2xl rounded-xl sm:rounded-2xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer font-black"
          >
            0
          </button>

          <button
            onClick={handleSubmit}
            disabled={feedback.type !== null || inputVal === ''}
            className="py-2.5 sm:py-3 btn-vibrant-pink border-2 border-pink-700 font-jua text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center justify-center"
          >
            확인 ↵
          </button>
        </div>
      </div>
    </div>
  );
};
