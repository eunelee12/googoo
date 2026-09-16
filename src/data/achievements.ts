import { Achievement, UserProfile, SessionResult } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: '첫 문제 도전!',
    description: '구구단 연습을 시작하고 첫 세션을 마쳤습니다.',
    icon: '🚩',
    condition: (p: UserProfile) => p.totalSessions >= 1
  },
  {
    id: 'perfect_10',
    title: '백점 만점에 백점!',
    description: '10문제를 모두 맞혀 100점을 기록했습니다.',
    icon: '💯',
    condition: (p: UserProfile, s?: SessionResult) => (s && s.score === 100) || p.history.some(h => h.score === 100)
  },
  {
    id: 'sprout_rank',
    title: '새싹의 반란',
    description: '10문제 이상 맞혀 새싹 계급으로 승급했습니다.',
    icon: '🌿',
    condition: (p: UserProfile) => p.totalCorrect >= 10
  },
  {
    id: 'speed_runner',
    title: '번개 같은 순발력!',
    description: '스피드 타임어택 모드를 완주했습니다.',
    icon: '⚡',
    condition: (p: UserProfile, s?: SessionResult) => (s && s.mode === 'timeattack') || p.history.some(h => h.mode === 'timeattack')
  },
  {
    id: 'master_50',
    title: '구구단 달인',
    description: '누적 정답 50문제를 달성했습니다.',
    icon: '⭐',
    condition: (p: UserProfile) => p.totalCorrect >= 50
  },
  {
    id: 'weakness_conqueror',
    title: '약점 극복 왕!',
    description: '약점 극복 모드를 통해 부족한 단을 연습했습니다.',
    icon: '🎯',
    condition: (p: UserProfile, s?: SessionResult) => (s && s.mode === 'weakness') || p.history.some(h => h.mode === 'weakness')
  },
  {
    id: 'legend_100',
    title: '백전백승 영웅',
    description: '누적 정답 100문제를 달성했습니다.',
    icon: '🏆',
    condition: (p: UserProfile) => p.totalCorrect >= 100
  }
];
