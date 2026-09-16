import React from 'react';
import { UserProfile, QuizMode } from '../types';
import { sounds } from '../utils/audio';

interface HistoryViewProps {
  user: UserProfile;
  onStartWeaknessQuiz: (mode: QuizMode) => void;
  onResetData: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  user,
  onStartWeaknessQuiz,
  onResetData,
}) => {
  const history = user.history || [];
  const weaknesses = Object.entries(user.weaknessMap || {})
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 10);

  const overallAccuracy =
    user.totalSolved > 0
      ? Math.round((user.totalCorrect / user.totalSolved) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-yellow-300 text-center space-y-2">
        <div className="inline-block bg-pink-100 border border-pink-300 text-pink-600 font-bold text-xs px-3 py-1 rounded-full">
          📊 나의 연습 성장기 기록
        </div>
        <h2 className="font-jua text-3xl text-pink-500 font-black">
          이전 점수 및 연습 기록
        </h2>
        <p className="font-gaegu text-xl text-slate-700 font-bold">
          내가 얼마나 성장했는지 한눈에 살펴보고 부족한 문제를 복습해봐요!
        </p>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-xs text-center">
          <div className="text-xs font-bold text-blue-500">총 연습 횟수</div>
          <div className="font-jua text-2xl text-slate-800">{user.totalSessions}회</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-xs text-center">
          <div className="text-xs font-bold text-blue-500">누적 푼 문제</div>
          <div className="font-jua text-2xl text-slate-800">{user.totalSolved}문제</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-green-200 shadow-xs text-center">
          <div className="text-xs font-bold text-emerald-600">평균 정답률</div>
          <div className="font-jua text-2xl text-emerald-700">{overallAccuracy}%</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-pink-200 shadow-xs text-center">
          <div className="text-xs font-bold text-pink-500">최고 점수</div>
          <div className="font-jua text-2xl text-pink-600">{user.highScore}점</div>
        </div>
      </div>

      {/* Weakness Analysis Box */}
      <div className="bg-white rounded-3xl p-6 border-4 border-pink-200 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-jua text-xl text-slate-800 flex items-center gap-2">
              <span>🎯</span> 자주 틀린 오답 문제 (약점 분석)
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              더 자주 틀렸던 문제들을 모아 집중적으로 연습할 수 있어요.
            </p>
          </div>

          {weaknesses.length > 0 && (
            <button
              onClick={() => {
                sounds.playClick();
                onStartWeaknessQuiz('weakness');
              }}
              className="font-jua text-xs btn-vibrant-pink border border-pink-700 px-3.5 py-2 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
            >
              약점문제 집중풀기 🎯
            </button>
          )}
        </div>

        {weaknesses.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {weaknesses.map(([key, count]) => {
              const [n1, n2] = key.split('x');
              return (
                <div
                  key={key}
                  className="bg-rose-50 border-2 border-rose-200 p-3 rounded-2xl text-center"
                >
                  <div className="font-jua text-lg text-rose-950 font-bold">
                    {n1} × {n2} = {Number(n1) * Number(n2)}
                  </div>
                  <div className="text-[11px] font-bold text-rose-600">
                    {count}번 틀림
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-2xl text-center text-yellow-900 font-jua text-sm border-2 border-yellow-300">
            🌱 아직 틀린 문제가 없거나 약점 데이터가 쌓이지 않았어요! 참 잘하고 있어요!
          </div>
        )}
      </div>

      {/* Practice Logs Table */}
      <div className="bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-md space-y-4">
        <h3 className="font-jua text-xl text-slate-800 flex items-center gap-2">
          <span>📜</span> 세션별 점수 히스토리
        </h3>

        {history.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((item, idx) => {
              const dateStr = new Date(item.timestamp).toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-yellow-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-300 font-jua text-base text-pink-600 flex items-center justify-center font-bold">
                      {item.score}점
                    </div>
                    <div>
                      <div className="font-jua text-sm text-slate-800">
                        10문제 ({item.correctCount}개 정답) - {item.durationSec}초 소요
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans font-bold">
                        {dateStr} • {item.mode === 'dragdrop' ? '🧩 답찾기' : item.mode === 'timeattack' ? '⚡ 타임어택' : item.selectedDan ? `${item.selectedDan}단` : '🌈 전체혼합'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-jua text-xs px-2.5 py-1 rounded-full ${
                      item.score === 100
                        ? 'bg-yellow-300 text-yellow-950 font-bold border border-yellow-400'
                        : item.score >= 70
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {item.score === 100 ? '💯 백점!' : `${item.score}점`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 font-jua text-base">
            아직 저장된 이전 점수가 없어요. 10문제를 풀면 기록이 자동으로 저장돼요!
          </div>
        )}
      </div>

      {/* Data Reset Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (window.confirm('정말로 모든 점수와 기록을 초기화하시겠습니까?')) {
              onResetData();
            }
          }}
          className="text-xs text-slate-400 hover:text-rose-500 font-bold underline"
        >
          기록 및 점수 초기화하기 🗑️
        </button>
      </div>
    </div>
  );
};
