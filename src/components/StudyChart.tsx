import React, { useState } from 'react';
import { sounds } from '../utils/audio';

export const StudyChart: React.FC = () => {
  const [selectedDan, setSelectedDan] = useState<number>(2);
  const [highlightCell, setHighlightCell] = useState<{ n1: number; n2: number } | null>(null);

  const pronunciations: Record<string, string> = {
    '2x1': '이 일은 이', '2x2': '이 이는 사', '2x3': '이 삼은 육', '2x4': '이 사는 팔', '2x5': '이 오십', '2x6': '이 육십이', '2x7': '이 칠십사', '2x8': '이 팔십육', '2x9': '이 구십팔',
    '3x1': '삼 일은 삼', '3x2': '삼 이는 육', '3x3': '삼 삼은 구', '3x4': '삼 사십이', '3x5': '삼 오십오', '3x6': '삼 육십팔', '3x7': '삼 칠이십일', '3x8': '삼 팔이십사', '3x9': '삼 구이십칠',
    '4x1': '사 일은 사', '4x2': '사 이는 팔', '4x3': '사 삼십이', '4x4': '사 사십육', '4x5': '사 오이십', '4x6': '사 육이십사', '4x7': '사 칠이십팔', '4x8': '사 팔삼십이', '4x9': '사 구삼십육',
    '5x1': '오 일은 오', '5x2': '오 이십', '5x3': '오 삼십오', '5x4': '오 사이십', '5x5': '오 오이십오', '5x6': '오 육삼십', '5x7': '오 칠삼십오', '5x8': '오 팔사십', '5x9': '오 구사십오',
    '6x1': '육 일은 육', '6x2': '육 이십이', '6x3': '육 삼십팔', '6x4': '육 사이십사', '6x5': '육 오삼십', '6x6': '육 육삼십육', '6x7': '육 칠사십이', '6x8': '육 팔사십팔', '6x9': '육 구오십사',
    '7x1': '칠 일은 칠', '7x2': '칠 이십사', '7x3': '칠 삼이십일', '7x4': '칠 사이십팔', '7x5': '칠 오삼십오', '7x6': '칠 육사십이', '7x7': '칠 칠사십구', '7x8': '칠 팔오십육', '7x9': '칠 구육십삼',
    '8x1': '팔 일은 팔', '8x2': '팔 이십육', '8x3': '팔 삼이십사', '8x4': '팔 삼십이', '8x5': '팔 오사십', '8x6': '팔 육사십팔', '8x7': '팔 칠오십육', '8x8': '팔 팔육십사', '8x9': '팔 구칠십이',
    '9x1': '구 일은 구', '9x2': '구 이십팔', '9x3': '구 삼이십칠', '9x4': '구 삼십육', '9x5': '구 오사십오', '9x6': '구 육오십사', '9x7': '구 칠육십삼', '9x8': '구 팔칠십이', '9x9': '구 구팔십일',
  };

  const handleCellClick = (n1: number, n2: number) => {
    sounds.playCorrect();
    setHighlightCell({ n1, n2 });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-yellow-300 text-center space-y-2">
        <div className="inline-block bg-pink-100 border border-pink-300 text-pink-600 font-bold text-xs px-3 py-1 rounded-full">
          📖 구구단 공부방
        </div>
        <h2 className="font-jua text-3xl text-pink-500 font-black">
          대화형 구구단표 학습
        </h2>
        <p className="font-gaegu text-xl text-slate-700 font-bold">
          원하는 단을 클릭해서 리듬감 있게 외우고 시각화해서 공부해보세요!
        </p>
      </div>

      {/* Dan Selection Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[2, 3, 4, 5, 6, 7, 8, 9].map((dan) => (
          <button
            key={dan}
            onClick={() => {
              sounds.playClick();
              setSelectedDan(dan);
              setHighlightCell(null);
            }}
            className={`px-4 py-2 rounded-2xl font-jua text-lg transition-all cursor-pointer ${
              selectedDan === dan
                ? 'btn-vibrant-pink border-2 border-pink-700 scale-105'
                : 'bg-white text-slate-800 border-2 border-yellow-300 hover:bg-yellow-50'
            }`}
          >
            {dan}단
          </button>
        ))}
      </div>

      {/* Selected Dan Detailed View */}
      <div className="bg-white rounded-3xl p-6 border-4 border-pink-200 shadow-md space-y-4">
        <div className="text-center">
          <h3 className="font-jua text-3xl text-pink-500 font-black">
            ✨ {selectedDan}단 완벽 공부하기 ✨
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            각 수식을 누르면 한글 소리 표현과 시각적 설명을 확인할 수 있어요!
          </p>
        </div>

        {/* 9 Multiplication Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num2) => {
            const key = `${selectedDan}x${num2}`;
            const pron = pronunciations[key] || '';
            const isHighlighted =
              highlightCell?.n1 === selectedDan && highlightCell?.n2 === num2;

            return (
              <button
                key={num2}
                onClick={() => handleCellClick(selectedDan, num2)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isHighlighted
                    ? 'bg-yellow-100 border-yellow-400 shadow-md ring-2 ring-yellow-300 scale-102'
                    : 'bg-slate-50 hover:bg-yellow-50 border-slate-200'
                }`}
              >
                <div className="font-jua text-2xl text-slate-900 flex items-center justify-between">
                  <span>
                    {selectedDan} × {num2} = {selectedDan * num2}
                  </span>
                  <span className="text-xs font-sans text-pink-500 font-bold">
                    🔍
                  </span>
                </div>
                <div className="text-xs font-gaegu text-blue-600 font-extrabold text-right mt-1">
                  "{pron}"
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Expression Detailed Visual Popup */}
        {highlightCell && (
          <div className="bg-yellow-100/80 rounded-2xl p-4 border-2 border-yellow-300 text-center space-y-2 animate-pop">
            <div className="font-jua text-2xl text-pink-600 font-bold">
              💡 {highlightCell.n1} × {highlightCell.n2} = {highlightCell.n1 * highlightCell.n2}
            </div>
            <p className="font-gaegu text-xl text-slate-800 font-bold">
              소리 내어 읽어봐요: "{pronunciations[`${highlightCell.n1}x${highlightCell.n2}`]}"
            </p>
            <p className="text-xs text-slate-600 font-bold">
              {highlightCell.n1}을 {highlightCell.n2}번 더한 수치예요! (
              {Array(highlightCell.n2).fill(highlightCell.n1).join(' + ')} ={' '}
              {highlightCell.n1 * highlightCell.n2})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
