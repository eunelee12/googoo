import { UserProfile, SessionResult } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'gugudan_tutor_user_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: '구구 어린이',
  totalSolved: 0,
  totalCorrect: 0,
  totalSessions: 0,
  highScore: 0,
  weaknessMap: {},
  unlockedAchievements: [],
  history: []
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      weaknessMap: parsed.weaknessMap || {},
      history: parsed.history || [],
      unlockedAchievements: parsed.unlockedAchievements || []
    };
  } catch (e) {
    console.error('Failed to load user profile from localStorage', e);
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile to localStorage', e);
  }
}

export function recordSessionResult(session: SessionResult): {
  updatedProfile: UserProfile;
  newlyUnlockedAchievements: string[];
} {
  const current = loadUserProfile();

  const newTotalSolved = current.totalSolved + session.totalQuestions;
  const newTotalCorrect = current.totalCorrect + session.correctCount;
  const newTotalSessions = current.totalSessions + 1;
  const newHighScore = Math.max(current.highScore, session.score);

  // Update weakness map for missed questions
  const updatedWeaknessMap = { ...current.weaknessMap };
  session.questions.forEach(q => {
    if (!q.isCorrect) {
      const key = `${q.num1}x${q.num2}`;
      updatedWeaknessMap[key] = (updatedWeaknessMap[key] || 0) + 1;
    }
  });

  const updatedHistory = [session, ...current.history].slice(0, 100); // keep last 100 sessions

  const interimProfile: UserProfile = {
    ...current,
    totalSolved: newTotalSolved,
    totalCorrect: newTotalCorrect,
    totalSessions: newTotalSessions,
    highScore: newHighScore,
    weaknessMap: updatedWeaknessMap,
    history: updatedHistory
  };

  // Check new achievements
  const newlyUnlockedAchievements: string[] = [];
  const currentUnlocked = new Set(current.unlockedAchievements);

  ACHIEVEMENTS.forEach(ach => {
    if (!currentUnlocked.has(ach.id)) {
      if (ach.condition(interimProfile, session)) {
        currentUnlocked.add(ach.id);
        newlyUnlockedAchievements.push(ach.id);
      }
    }
  });

  const finalProfile: UserProfile = {
    ...interimProfile,
    unlockedAchievements: Array.from(currentUnlocked)
  };

  saveUserProfile(finalProfile);

  return {
    updatedProfile: finalProfile,
    newlyUnlockedAchievements
  };
}

export function updateStudentName(newName: string): UserProfile {
  const profile = loadUserProfile();
  profile.name = newName.trim() || '구구 어린이';
  saveUserProfile(profile);
  return profile;
}

export function resetAllData(): UserProfile {
  saveUserProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}
