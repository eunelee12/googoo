import React, { useEffect } from 'react';
import { SessionResult, UserProfile } from '../types';
import { getCurrentRank, getNextRank } from '../data/ranks';
import { triggerRankUpFireworks, triggerCorrectFireworks } from '../utils/confetti';
import { sounds } from '../utils/audio';

interface ResultScreenProps {
  session: SessionResult;
  user: UserProfile;
  newlyUnlocked: string[];
  onRestartQuiz: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  session,
  user,
  newlyUnlocked,
  onRestartQuiz,
  onGoHome,
}) => {
  const currentRank = getCurrentRank(user.totalCorrect);
  const { nextRank, remaining, progressPercent } = getNextRank(user.totalCorrect);

  useEffect(() => {
    if (session.score === 100) {
      sounds.playFanfare();
      triggerRankUpFireworks();
    } else if (session.score >= 70) {
      sounds.playCorrect();
      triggerCorrectFireworks();
    }
  }, [session.score]);

  const getScoreGradeMessage = (score: number) => {
    if (score === 100) return '💯 백점 만점! 참 잘했어요! 축하 폭죽 팡팡!';
    if (score >= 80) return '🌟 대단해요! 완벽에 가까운 실력이에요!';
    if (score >= 60) return '👍 잘하고 있어요! 조금만 더 연습해보자!';
    return '🌱 틀린 문제를 복습하면 다음엔 백점이 될 거예요!';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Session Result Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-yellow-300 shadow-xl text-center space-y-6 relative overflow-hidden">
        <div className="inline-block bg-pink-100 text-pink-600 font-jua text-sm px-4 py-1.5 rounded-full border-2 border-pink-300 font-bold">
          🎉 10문제 연습 완료!
        </div>

        {/* Score Badge */}
        <div>
          <div className="font-jua text-6xl sm:text-7xl text-pink-500 tracking-tight drop-shadow-sm font-black">
            {session.score}<span className="text-3xl text-blue-500 font-bold">점</span>
          </div>
          <p className="font-gaegu text-xl sm:text-2xl text-slate-800 font-bold mt-2">
            {getScoreGradeMessage(session.score)}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-blue-200">
          <div>
            <div className="text-xs text-blue-600 font-bold">맞힌 개수</div>
            <div className="font-jua text-xl text-slate-900">
              {session.correctCount} / {session.totalQuestions}개
            </div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-bold">소요 시간</div>
            <div className="font-jua text-xl text-slate-900">
              {session.durationSec}초
            </div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-bold">모드</div>
            <div className="font-jua text-sm text-slate-900 mt-1">
              {session.mode === 'dragdrop' ? '🧩 답찾기' : session.mode === 'timeattack' ? '⚡ 타임어택' : session.mode === 'weakness' ? '🎯 약점극복' : '🐣 일반'}
            </div>
          </div>
        </div>

        {/* Newly Unlocked Achievements Badge Notice */}
        {newlyUnlocked.length > 0 && (
          <div className="bg-yellow-200 p-4 rounded-2xl border-2 border-yellow-400 shadow-sm animate-pop text-yellow-950 font-jua">
            <div className="text-lg">🏆 새로운 업적 달성!</div>
            <div className="text-xs font-sans font-bold opacity-90 mt-0.5">
              열심히 노력한 결과 새로운 훈장을 획득했어요!
            </div>
          </div>
        )}

        {/* Rank Growth Roadmap Bar */}
        <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-300 text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentRank.icon}</span>
              <div>
                <span className="text-xs font-bold text-blue-500">현재 계급</span>
                <div className="font-jua text-base text-slate-900">
                  Lv.{currentRank.level} {currentRank.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-500">누적 정답 수</span>
              <div className="font-jua text-base text-slate-900">
                {user.totalCorrect}개
              </div>
            </div>
          </div>

          {nextRank ? (
            <div className="space-y-1 pt-1">
              <div className="w-full h-3.5 bg-white rounded-full border border-yellow-300 p-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="text-[11px] font-bold text-pink-600 text-right">
                다음 계급({nextRank.icon} {nextRank.name})까지 {remaining}개 남음!
              </div>
            </div>
          ) : (
            <div className="text-xs font-bold text-center text-yellow-900 pt-1">
              👑 최고 계급 전설의 신 등극! 👑
            </div>
          )}
        </div>

        {/* Detailed Question Review List */}
        <div className="text-left space-y-3">
          <h4 className="font-jua text-lg text-slate-800 flex items-center gap-2">
            <span>📋</span> 이번 1차시 10문제 결과 보기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {session.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between text-sm ${
                  q.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      q.isCorrect
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {q.isCorrect ? 'O' : 'X'}
                  </span>
                  <span className="font-jua text-base">
                    {q.num1} × {q.num2} = {q.answer}
                  </span>
                </div>
                <div className="text-right text-xs">
                  {q.isCorrect ? (
                    <span className="font-bold text-emerald-700">정답!</span>
                  ) : (
                    <span className="font-bold text-rose-700">
                      입력: {q.userAnswer === -1 ? '시간초과' : q.userAnswer ?? '-'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onRestartQuiz();
            }}
            className="w-full sm:flex-1 py-3.5 px-6 btn-vibrant-pink font-jua text-xl rounded-2xl border-2 border-pink-700 transition-all cursor-pointer"
          >
            다시 10문제 도전! 🔄
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onGoHome();
            }}
            className="w-full sm:flex-1 py-3.5 px-6 btn-vibrant-blue font-jua text-xl rounded-2xl border-2 border-blue-700 transition-all cursor-pointer"
          >
            메인 화면으로 🏠
          </button>
        </div>
      </div>
    </div>
  );
};
