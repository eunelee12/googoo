export interface Rank {
  level: number;
  name: string;
  icon: string;
  minCorrect: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  rewardMessage: string;
}

export interface Question {
  id: string;
  num1: number;
  num2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeTakenSec?: number;
}

export interface SessionResult {
  id: string;
  timestamp: number;
  mode: 'all' | 'specific' | 'timeattack' | 'weakness' | 'dragdrop';
  selectedDan?: number; // 2~9 if specific
  totalQuestions: number;
  correctCount: number;
  score: number; // e.g. 100
  durationSec: number;
  questions: Question[];
}

export type QuizMode = 'all' | 'specific' | 'timeattack' | 'weakness' | 'dragdrop';

export interface UserProfile {
  name: string;
  totalSolved: number;
  totalCorrect: number;
  totalSessions: number;
  highScore: number;
  weaknessMap: Record<string, number>; // "7x8": countOfErrors
  unlockedAchievements: string[];
  history: SessionResult[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile, currentSession?: SessionResult) => boolean;
}
