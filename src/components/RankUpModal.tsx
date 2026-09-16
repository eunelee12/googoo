import React, { useEffect } from 'react';
import { Rank } from '../types';
import { triggerRankUpFireworks } from '../utils/confetti';
import { sounds } from '../utils/audio';

interface RankUpModalProps {
  rank: Rank;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({ rank, onClose }) => {
  useEffect(() => {
    sounds.playFanfare();
    triggerRankUpFireworks();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-pop">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-400 shadow-2xl text-center space-y-5 relative">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-300 to-yellow-200 rounded-3xl border-4 border-amber-500 shadow-lg mx-auto flex items-center justify-center text-6xl animate-bounce">
          {rank.icon}
        </div>

        <div>
          <div className="inline-block bg-amber-100 text-amber-900 font-jua text-sm px-3 py-1 rounded-full border border-amber-300 mb-1">
            🎉 축하합니다! 승급 달성!
          </div>
          <h2 className="font-jua text-3xl text-amber-950">
            Lv.{rank.level} {rank.name}
          </h2>
          <p className="font-gaegu text-xl text-amber-800 font-bold mt-2">
            "{rank.rewardMessage}"
          </p>
        </div>

        <p className="text-xs text-slate-500 font-bold bg-amber-50 p-3 rounded-2xl border border-amber-200">
          {rank.description}
        </p>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-jua text-xl rounded-2xl border-3 border-amber-600 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          야호! 계속 구구단 도전하기! 🚀
        </button>
      </div>
    </div>
  );
};
