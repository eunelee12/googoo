import React from 'react';
import { RANKS, getCurrentRank } from '../data/ranks';
import { UserProfile } from '../types';
import { sounds } from '../utils/audio';

interface RankRoadmapProps {
  user: UserProfile;
  onGoPractice: () => void;
}

export const RankRoadmap: React.FC<RankRoadmapProps> = ({ user, onGoPractice }) => {
  const currentRank = getCurrentRank(user.totalCorrect);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-yellow-300 text-center space-y-2">
        <div className="inline-block bg-pink-100 border border-pink-300 text-pink-600 font-bold text-xs px-3 py-1 rounded-full">
          👑 구구단 명예의 전당
        </div>
        <h2 className="font-jua text-3xl text-pink-500 font-black">
          계급 올리기 로드맵
        </h2>
        <p className="font-gaegu text-xl text-slate-700 font-bold max-w-lg mx-auto">
          문제를 많이 맞힐수록 계급이 올라가요! 차근차근 전설의 신에 도전해볼까요?
        </p>
      </div>

      {/* Student Current Stats Card */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-4 border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-pink-100 rounded-2xl border-2 border-pink-300 flex items-center justify-center text-3xl">
            {currentRank.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-blue-500">현재 계급</div>
            <h3 className="font-jua text-2xl text-slate-800">
              Lv.{currentRank.level} {currentRank.name}
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              누적 맞힌 문제: <strong className="text-pink-600 font-jua text-sm">{user.totalCorrect}개</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onGoPractice();
          }}
          className="font-jua text-sm btn-vibrant-pink border-2 border-pink-700 px-4 py-2 rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          연습하러 가기 🚀
        </button>
      </div>

      {/* Ranks List */}
      <div className="space-y-3">
        {RANKS.map((rank) => {
          const isUnlocked = user.totalCorrect >= rank.minCorrect;
          const isCurrent = currentRank.level === rank.level;

          return (
            <div
              key={rank.level}
              className={`p-4 rounded-3xl border-3 transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-yellow-50 border-yellow-400 shadow-md ring-2 ring-yellow-300'
                  : isUnlocked
                  ? 'bg-white border-blue-200 opacity-95'
                  : 'bg-slate-50 border-slate-200 opacity-60 grayscale-[0.3]'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shrink-0 ${
                    isUnlocked
                      ? 'bg-pink-100 border-pink-300'
                      : 'bg-slate-200 border-slate-300'
                  }`}
                >
                  {rank.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-jua text-lg text-slate-900">
                      Lv.{rank.level} {rank.name}
                    </span>
                    {isCurrent && (
                      <span className="bg-pink-500 text-white font-jua text-[10px] px-2 py-0.5 rounded-full">
                        현재 계급!
                      </span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        달성 완료 ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {rank.description}
                  </p>
                </div>
              </div>

              {/* Right Requirement */}
              <div className="text-right shrink-0 font-jua">
                <div className="text-xs text-slate-400">필요 정답 수</div>
                <div
                  className={`text-base ${
                    isUnlocked ? 'text-pink-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  {rank.minCorrect}문제 이상
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
