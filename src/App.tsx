import { useState, useEffect } from 'react';
import { UserProfile, QuizMode, SessionResult, Rank } from './types';
import {
  loadUserProfile,
  recordSessionResult,
  updateStudentName,
  resetAllData,
} from './utils/storage';
import { getCurrentRank } from './data/ranks';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { RankRoadmap } from './components/RankRoadmap';
import { HistoryView } from './components/HistoryView';
import { StudyChart } from './components/StudyChart';
import { RankUpModal } from './components/RankUpModal';

export default function App() {
  const [user, setUser] = useState<UserProfile>(loadUserProfile());
  const [activeTab, setActiveTab] = useState<'home' | 'ranks' | 'history' | 'study'>('home');
  const [currentScreen, setCurrentScreen] = useState<'start' | 'quiz' | 'result'>('start');

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active quiz config
  const [quizMode, setQuizMode] = useState<QuizMode>('all');
  const [selectedDan, setSelectedDan] = useState<number | undefined>(undefined);
  const [lastSessionResult, setLastSessionResult] = useState<SessionResult | null>(null);

  // Rank up notification state
  const [rankUpAlert, setRankUpAlert] = useState<Rank | null>(null);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([]);

  // Load user on mount
  useEffect(() => {
    setUser(loadUserProfile());
  }, []);

  // Update student name
  const handleUpdateName = (newName: string) => {
    const updated = updateStudentName(newName);
    setUser(updated);
  };

  // Start 10-question practice session
  const handleStartQuiz = (mode: QuizMode, dan?: number) => {
    setQuizMode(mode);
    setSelectedDan(dan);
    setCurrentScreen('quiz');
  };

  // Finish 10-question session
  const handleFinishQuiz = (result: SessionResult) => {
    const prevRank = getCurrentRank(user.totalCorrect);

    // Record session and get updated profile
    const { updatedProfile, newlyUnlockedAchievements: newAchs } = recordSessionResult(result);
    setUser(updatedProfile);
    setLastSessionResult(result);
    setNewlyUnlockedAchievements(newAchs);

    const newRank = getCurrentRank(updatedProfile.totalCorrect);
    if (newRank.level > prevRank.level) {
      setRankUpAlert(newRank);
    }

    setCurrentScreen('result');
  };

  // Reset user data
  const handleResetData = () => {
    const reset = resetAllData();
    setUser(reset);
    setCurrentScreen('start');
    setActiveTab('home');
  };

  return (
    <div className="h-screen max-h-screen bg-kids-pattern font-sans text-slate-800 flex flex-col antialiased selection:bg-amber-200 overflow-hidden">
      {/* Top Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentScreen('start');
        }}
        onUpdateName={handleUpdateName}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4 overflow-y-auto flex flex-col min-h-0">
        {activeTab === 'home' && (
          <>
            {currentScreen === 'start' && (
              <StartScreen
                user={user}
                onStartQuiz={handleStartQuiz}
                onOpenRanks={() => setActiveTab('ranks')}
              />
            )}

            {currentScreen === 'quiz' && (
              <QuizScreen
                mode={quizMode}
                selectedDan={selectedDan}
                weaknessMap={user.weaknessMap || {}}
                onFinishQuiz={handleFinishQuiz}
                onQuitQuiz={() => setCurrentScreen('start')}
              />
            )}

            {currentScreen === 'result' && lastSessionResult && (
              <ResultScreen
                session={lastSessionResult}
                user={user}
                newlyUnlocked={newlyUnlockedAchievements}
                onRestartQuiz={() => setCurrentScreen('quiz')}
                onGoHome={() => setCurrentScreen('start')}
              />
            )}
          </>
        )}

        {activeTab === 'ranks' && (
          <RankRoadmap
            user={user}
            onGoPractice={() => {
              setActiveTab('home');
              setCurrentScreen('start');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            user={user}
            onStartWeaknessQuiz={(mode) => {
              setActiveTab('home');
              handleStartQuiz(mode);
            }}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'study' && <StudyChart />}
      </main>

      {/* Rank Up Celebration Modal */}
      {rankUpAlert && (
        <RankUpModal
          rank={rankUpAlert}
          onClose={() => setRankUpAlert(null)}
        />
      )}
    </div>
  );
}
