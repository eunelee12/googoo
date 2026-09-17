import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getCurrentRank } from '../data/ranks';
import { sounds } from '../utils/audio';

interface HeaderProps {
  user: UserProfile;
  activeTab: 'home' | 'ranks' | 'history' | 'study';
  setActiveTab: (tab: 'home' | 'ranks' | 'history' | 'study') => void;
  onUpdateName: (name: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onUpdateName,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const currentRank = getCurrentRank(user.totalCorrect);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-30 bg-yellow-100/90 backdrop-blur-md border-b-4 border-yellow-300 shadow-md px-2 sm:px-4 py-2 sm:py-2.5 flex-shrink-0">
      <div className="max-w-4xl mx-auto flex flex-row items-center justify-between gap-1.5 sm:gap-3 w-full flex-nowrap">
        {/* Title & Student Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-shrink">
          <div
            onClick={() => {
              sounds.playClick();
              setActiveTab('home');
            }}
            className="cursor-pointer flex items-center gap-1 sm:gap-2 group flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-400 to-pink-500 flex items-center justify-center text-lg sm:text-2xl shadow-md border-2 border-pink-600 transform group-hover:scale-105 transition-transform flex-shrink-0">
              ⭐
            </div>
            <div className="min-w-0 flex-shrink">
              <h1 className="font-jua text-base sm:text-2xl text-pink-500 tracking-tight drop-shadow-xs font-black whitespace-nowrap leading-none flex items-center gap-1">
                <span>구구단연습기!</span>
              </h1>
            </div>
          </div>

          {/* Student Profile Pill beside title */}
          <div className="flex items-center gap-1 bg-white border-2 border-yellow-300 rounded-full px-2 py-0.5 text-xs shadow-xs whitespace-nowrap flex-shrink-0">
            <span className="text-sm sm:text-base">{currentRank.icon}</span>
            <div className="flex items-center gap-1">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                    }}
                    maxLength={10}
                    className="w-16 sm:w-20 px-1 py-0.5 text-xs bg-white border border-blue-400 rounded-md font-bold focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={handleNameSave}
                    className="text-[10px] sm:text-xs bg-pink-500 text-white font-bold px-1.5 py-0.5 rounded-md hover:bg-pink-600 cursor-pointer"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNameInput(user.name);
                    setIsEditingName(true);
                  }}
                  className="font-bold text-slate-800 hover:text-pink-600 flex items-center gap-0.5 cursor-pointer text-xs sm:text-sm"
                  title="학생 이름 수정하기"
                >
                  <span className="max-w-[70px] sm:max-w-none truncate">{user.name}</span>
                  <span className="text-[10px] text-pink-400">✏️</span>
                </button>
              )}
              <span className="hidden sm:inline text-[10px] font-bold text-green-700 bg-green-100 border border-green-300 px-1.5 py-0.5 rounded-full">
                Lv.{currentRank.level} {currentRank.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Sound Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <nav className="flex items-center bg-white p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 border-yellow-300 shadow-xs flex-nowrap">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('home');
              }}
              className={`px-1.5 sm:px-3 py-1 rounded-lg sm:rounded-xl font-jua text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'home'
                  ? 'btn-vibrant-pink scale-102 font-bold'
                  : 'text-slate-700 hover:bg-yellow-50'
              }`}
            >
              🏠 <span className="hidden xs:inline">연습하기</span><span className="xs:hidden">연습</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('study');
              }}
              className={`px-1.5 sm:px-3 py-1 rounded-lg sm:rounded-xl font-jua text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'study'
                  ? 'btn-vibrant-pink scale-102 font-bold'
                  : 'text-slate-700 hover:bg-yellow-50'
              }`}
            >
              📖 <span className="hidden xs:inline">구구단표</span><span className="xs:hidden">단표</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('ranks');
              }}
              className={`px-1.5 sm:px-3 py-1 rounded-lg sm:rounded-xl font-jua text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ranks'
                  ? 'btn-vibrant-pink scale-102 font-bold'
                  : 'text-slate-700 hover:bg-yellow-50'
              }`}
            >
              👑 <span className="hidden xs:inline">계급장</span><span className="xs:hidden">계급</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('history');
              }}
              className={`px-1.5 sm:px-3 py-1 rounded-lg sm:rounded-xl font-jua text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'btn-vibrant-pink scale-102 font-bold'
                  : 'text-slate-700 hover:bg-yellow-50'
              }`}
            >
              📊 <span className="hidden xs:inline">나의기록</span><span className="xs:hidden">기록</span>
            </button>
          </nav>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg border-2 transition-all cursor-pointer flex-shrink-0 ${
              soundEnabled
                ? 'bg-yellow-200 border-yellow-400 text-yellow-900 hover:bg-yellow-300'
                : 'bg-stone-200 border-stone-300 text-stone-500 hover:bg-stone-300'
            }`}
            title={soundEnabled ? '음성/효과음 켜짐' : '음성/효과음 꺼짐'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
};
