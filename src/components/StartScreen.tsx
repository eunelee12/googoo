import React, { useState } from 'react';
import { UserProfile, QuizMode } from '../types';
import { getCurrentRank, getNextRank, RANKS } from '../data/ranks';
import { TUTOR } from '../data/tutor';
import { sounds } from '../utils/audio';

interface StartScreenProps {
  user: UserProfile;
  onStartQuiz: (mode: QuizMode, selectedDan?: number) => void;
  onOpenRanks: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  user,
  onStartQuiz,
  onOpenRanks,
}) => {
  const [selectedDan, setSelectedDan] = useState<number | undefined>(undefined); // undefined means "Mixed all"
  const [selectedMode, setSelectedMode] = useState<QuizMode>('all');

  const currentRank = getCurrentRank(user.totalCorrect);
  const { nextRank, remaining, progressPercent } = getNextRank(user.totalCorrect);

  const hasWeakness = Object.keys(user.weaknessMap || {}).length > 0;

  const handleStart = () => {
    sounds.playClick();
    onStartQuiz(selectedMode, selectedDan);
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto my-auto w-full py-1">
      {/* Welcome Banner & Tutor Greeting */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-md border-3 sm:border-4 border-yellow-300 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-100 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex flex-row items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-2xl border-2 sm:border-3 border-pink-400 shadow-sm flex items-center justify-center text-2xl sm:text-4xl shrink-0 animate-float">
            {TUTOR.avatar}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="inline-block bg-blue-100 border border-blue-300 text-blue-700 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full mb-0.5">
              {TUTOR.name} 튜터 선생님
            </div>
            <h2 className="font-jua text-lg sm:text-2xl text-pink-500 mb-0.5 drop-shadow-xs font-black truncate">
              "{user.name} 어린이, 어서오세요! 🎉"
            </h2>
            <p className="font-gaegu text-sm sm:text-lg text-slate-700 font-bold leading-snug truncate">
              {TUTOR.greeting}
            </p>
          </div>
        </div>
      </div>

      {/* Current Rank & Next Rank Progress Roadmap */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border-2 sm:border-3 border-blue-200 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">{currentRank.icon}</span>
            <div>
              <div className="text-[10px] sm:text-xs font-black text-blue-500">현재 내 계급</div>
              <h3 className="font-jua text-base sm:text-xl text-slate-800 leading-tight">
                Lv.{currentRank.level} {currentRank.name}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenRanks();
            }}
            className="font-jua text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-900 border border-yellow-400 px-2.5 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-bold"
          >
            전체 계급 보기 👑
          </button>
        </div>

        {/* Progress Bar to Next Rank */}
        {nextRank ? (
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] sm:text-xs font-bold text-slate-600">
              <span>누적 정답: {user.totalCorrect}개</span>
              <span className="text-pink-600">
                다음 계급({nextRank.icon} {nextRank.name})까지 <strong className="text-pink-700 underline">{remaining}문제</strong> 남음!
              </span>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-slate-100 rounded-full border border-slate-300 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 rounded-xl p-2 text-center border border-yellow-300 font-jua text-yellow-900 text-xs sm:text-sm">
            👑 우와! 당신은 구구단 최고 계급인 '전설의 신'입니다! 최고예요! 👑
          </div>
        )}
      </div>

      {/* Stage & Mode Selection Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-md border-3 sm:border-4 border-pink-200 space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-jua text-base sm:text-xl text-slate-800 mb-0.5 flex items-center gap-1.5">
            <span>🎯</span> 연습할 단을 선택해요 (1차시 10문제)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
            원하는 단을 선택하거나 전체 단을 섞어서 연습할 수 있어요.
          </p>
        </div>

        {/* Dan Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedDan(undefined);
            }}
            className={`py-2 sm:py-2.5 px-1.5 rounded-xl sm:rounded-2xl font-jua text-xs sm:text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${
              selectedDan === undefined
                ? 'btn-vibrant-pink border-2 border-pink-600 scale-102 font-bold'
                : 'bg-slate-50 text-slate-800 border-2 border-slate-200 hover:bg-pink-50'
            }`}
          >
            <span className="text-base sm:text-lg">🌈</span>
            <span>전체 혼합</span>
            <span className="text-[9px] sm:text-[10px] opacity-80">(2~9단)</span>
          </button>

          {[2, 3, 4, 5, 6, 7, 8, 9].map((dan) => (
            <button
              key={dan}
              onClick={() => {
                sounds.playClick();
                setSelectedDan(dan);
              }}
              className={`py-2 sm:py-2.5 px-1.5 rounded-xl sm:rounded-2xl font-jua text-xs sm:text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${
                selectedDan === dan
                  ? 'btn-vibrant-blue border-2 border-blue-700 scale-102 font-bold'
                  : 'bg-slate-50 text-slate-800 border-2 border-slate-200 hover:bg-blue-50'
              }`}
            >
              <span className="text-xs sm:text-base font-bold">{dan}단</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">({dan}×1~9)</span>
            </button>
          ))}

          <button
            onClick={() => {
              sounds.playClick();
              setSelectedDan(11); // Challenge 11~19단
            }}
            className={`py-2 sm:py-2.5 px-1.5 rounded-xl sm:rounded-2xl font-jua text-xs sm:text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${
              selectedDan === 11
                ? 'btn-vibrant-orange border-2 border-orange-700 scale-102 font-bold'
                : 'bg-purple-50 text-purple-900 border-2 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span className="text-base sm:text-lg">🚀</span>
            <span>도전 11~19단</span>
            <span className="text-[9px] sm:text-[10px] opacity-80">(고난도)</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div>
          <h4 className="font-jua text-sm sm:text-base text-slate-800 mb-1.5 flex items-center gap-1.5">
            <span>⚙️</span> 연습 모드를 선택해요
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('all');
              }}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedMode === 'all'
                  ? 'bg-pink-50 border-pink-400 shadow-sm ring-2 ring-pink-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 font-jua text-pink-600 mb-0.5 text-xs sm:text-sm">
                <span className="text-base">🐣</span>
                <span>일반 연습</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-tight">
                제한 없이 차근차근 풀어요.
              </p>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('timeattack');
              }}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedMode === 'timeattack'
                  ? 'bg-blue-50 border-blue-400 shadow-sm ring-2 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 font-jua text-blue-600 mb-0.5 text-xs sm:text-sm">
                <span className="text-base">⚡</span>
                <span>스피드 타임</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-tight">
                문제당 10초 제한시간!
              </p>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('dragdrop');
              }}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedMode === 'dragdrop'
                  ? 'bg-purple-50 border-purple-400 shadow-sm ring-2 ring-purple-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 font-jua text-purple-700 mb-0.5 text-xs sm:text-sm">
                <span className="text-base">🧩</span>
                <span>답찾기(드래그)</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-tight">
                답 숫자를 문제 위에 겹쳐 놓기!
              </p>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('weakness');
              }}
              disabled={!hasWeakness}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedMode === 'weakness'
                  ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300'
                  : hasWeakness
                  ? 'bg-slate-50 border-slate-200 hover:bg-white'
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-1.5 font-jua text-amber-700 mb-0.5 text-xs sm:text-sm">
                <span className="text-base">🎯</span>
                <span>약점 극복</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-tight">
                {hasWeakness
                  ? '오답 문제 집중 풀기!'
                  : '오답 발생 시 오픈!'}
              </p>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-1">
          <button
            onClick={handleStart}
            className="w-full py-2.5 sm:py-3.5 px-4 btn-vibrant-pink font-jua text-xl sm:text-2xl rounded-xl sm:rounded-2xl border-2 border-pink-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>🚀</span>
            <span>10문제 연습 시작하기!</span>
            <span>✨</span>
          </button>
        </div>
      </div>

      {/* Quick Score Stats Bar */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border-2 border-blue-200 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold text-blue-500">총 푼 문제</div>
          <div className="font-jua text-lg sm:text-xl text-slate-800">{user.totalSolved}문제</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border-2 border-green-200 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold text-emerald-600">총 정답 수</div>
          <div className="font-jua text-lg sm:text-xl text-emerald-700">{user.totalCorrect}개</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border-2 border-pink-200 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold text-pink-500">최고 점수</div>
          <div className="font-jua text-lg sm:text-xl text-pink-600">{user.highScore}점</div>
        </div>
      </div>
    </div>
  );
};
