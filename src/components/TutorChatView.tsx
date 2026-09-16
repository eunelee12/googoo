import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { TUTOR } from '../data/tutor';
import { sounds } from '../utils/audio';
import { triggerCorrectFireworks } from '../utils/confetti';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TutorChatViewProps {
  user: UserProfile;
  onReturnToPractice: () => void;
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  user,
  onReturnToPractice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `안녕, ${user.name} 친구! 🌟 나는 구구단 요정 튜터야! 구구단에 대해 어떤 것이든 물어보거나, 재미있는 실생활 응용 문제를 함께 풀어볼까? 실생활 문제를 3개 맞히면 선물이 기다리고 있어!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading || isSessionFinished) return;

    sounds.playClick();

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: user.name,
          messages: newMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          solvedCount: solvedCount,
        }),
      });

      const data = await response.json();

      let nextSolved = solvedCount;
      if (data.isProblemSolved) {
        nextSolved += 1;
        setSolvedCount(nextSolved);
        triggerCorrectFireworks();
        sounds.playCorrect();
      }

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        role: 'assistant',
        content: data.reply || '구구단에 대해 궁금한 점을 이야기해 주세요!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.isFinished || nextSolved >= 3) {
        setIsSessionFinished(true);
        triggerCorrectFireworks();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: '연결에 문제가 발생했어요. 잠시 후 다시 시도해 주세요!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0 py-1 space-y-2">
      {/* Top Title & Progress Header */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-3 sm:border-4 border-yellow-300 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-xl border border-pink-400 flex items-center justify-center text-lg sm:text-2xl shrink-0">
            💬
          </div>
          <div>
            <h2 className="font-jua text-slate-800 text-sm sm:text-lg flex items-center gap-1.5 leading-tight">
              <span>구구단 튜터 대화</span>
              <span className="text-xs text-pink-500 font-normal hidden sm:inline">
                ({user.name} 친구 맞춤 선생님)
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-sans">
              구구단 질문을 하고 실생활 응용 문제를 함께 풀어봐요!
            </p>
          </div>
        </div>

        {/* Real-world Problem Solved Badge */}
        <div className="flex flex-col items-end">
          <div className="btn-vibrant-pink px-2.5 py-1 rounded-xl text-xs sm:text-sm font-jua border border-pink-700 shadow-xs flex items-center gap-1">
            <span>🎯 실생활 문제:</span>
            <span className="text-yellow-300 font-black text-sm sm:text-base">
              {solvedCount} / 3개
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border-3 border-blue-200 shadow-sm p-3 flex flex-col justify-between overflow-hidden min-h-0">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-sm sm:text-base shrink-0 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-pink-100 border-pink-400 text-pink-700'
                }`}
              >
                {msg.role === 'user' ? '👧' : TUTOR.avatar}
              </div>

              {/* Speech Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl p-2.5 sm:p-3 text-xs sm:text-sm font-sans leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none font-medium'
                    : 'bg-yellow-50 text-slate-800 border border-yellow-300 rounded-tl-none font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-jua p-2 animate-pulse">
              <span className="text-base">{TUTOR.avatar}</span>
              <span>튜터가 생각하고 있어요... 🤔</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Completion Banner if 3 problems solved */}
        {isSessionFinished && (
          <div className="my-2 p-3 bg-emerald-100 border-2 border-emerald-400 rounded-xl text-center space-y-2 animate-pop">
            <div className="font-jua text-emerald-900 text-sm sm:text-base font-bold flex items-center justify-center gap-1.5">
              <span>🏆</span>
              <span>축하해요! 실생활 응용 문제 3개를 모두 완수했습니다!</span>
            </div>
            <p className="text-xs text-emerald-800 font-sans">
              튜터와의 대화를 마무리하고 구구단 연습으로 돌아가볼까요?
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                onReturnToPractice();
              }}
              className="w-full py-2.5 btn-vibrant-pink border-2 border-pink-700 text-white font-jua text-sm sm:text-base rounded-xl shadow-md cursor-pointer hover:scale-[1.01] transition-transform"
            >
              구구단 연습 메뉴로 돌아가기 🚀
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        {!isSessionFinished && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => handleQuickPrompt('실생활 응용 문제 하나 내주세요!')}
                disabled={loading}
                className="bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-700 px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors"
              >
                🍎 실생활 문제 내줘!
              </button>
              <button
                onClick={() => handleQuickPrompt('구구단 7단 쉽게 외우는 팁이 뭐야?')}
                disabled={loading}
                className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-yellow-800 px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors"
              >
                💡 구구단 잘 외우는법
              </button>
              <button
                onClick={() => handleQuickPrompt('왜 구구단을 배워야 하나요?')}
                disabled={loading}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors"
              >
                ❓ 구구단 배우는 이유
              </button>
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="튜터에게 궁금한 점이나 답변을 적어보세요..."
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-pink-400 focus:bg-white focus:outline-hidden font-sans"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-3.5 py-2 btn-vibrant-pink border-2 border-pink-700 font-jua text-xs sm:text-sm rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1 shadow-xs whitespace-nowrap"
              >
                <span>전송</span>
                <span>➔</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
