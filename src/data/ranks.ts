import { Rank } from '../types';

export const RANKS: Rank[] = [
  {
    level: 1,
    name: '구구단 씨앗',
    icon: '🌱',
    minCorrect: 0,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    description: '구구단 탐험을 시작한 귀여운 씨앗이에요!',
    rewardMessage: '싹을 틔울 준비가 되었어요! 차근차근 문제를 풀어봐요!'
  },
  {
    level: 2,
    name: '구구단 새싹',
    icon: '🌿',
    minCorrect: 10,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: '파릇파릇 돋아난 구구단 새싹!',
    rewardMessage: '멋지게 첫 걸음을 뗐어요! 계속 피어나라!'
  },
  {
    level: 3,
    name: '구구단 병아리',
    icon: '🐣',
    minCorrect: 25,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    description: '삐약삐약 구구단을 척척 맞히는 아기새!',
    rewardMessage: '삐약삐약! 구구단 실력이 쑥쑥 늘고 있어요!'
  },
  {
    level: 4,
    name: '구구단 람쥐',
    icon: '🐿️',
    minCorrect: 50,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    description: '도토리를 모으듯 구구단을 착착 쌓아가는 람쥐!',
    rewardMessage: '구구단 실력이 도토리처럼 풍성해졌어요!'
  },
  {
    level: 5,
    name: '구구단 강아지',
    icon: '🐶',
    minCorrect: 80,
    color: 'text-amber-700',
    bgColor: 'bg-amber-200',
    borderColor: 'border-amber-400',
    description: '신나게 달리며 구구단을 정복하는 강아지!',
    rewardMessage: '멍멍! 이제 구구단이 너무 재미있어졌어요!'
  },
  {
    level: 6,
    name: '구구단 호랑이',
    icon: '🐯',
    minCorrect: 120,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    description: '용맹하게 어려운 구구단도 물리치는 호랑이!',
    rewardMessage: '어흥! 어려운 구구단도 문제없다!'
  },
  {
    level: 7,
    name: '구구단 탐험가',
    icon: '🧭',
    minCorrect: 170,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-300',
    description: '구구단 세상 곳곳을 정복한 미지의 탐험가!',
    rewardMessage: '새로운 구구단 대륙을 정복했습니다!'
  },
  {
    level: 8,
    name: '구구단 박사',
    icon: '🎓',
    minCorrect: 230,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
    description: '어떤 구구단이든 순식간에 계산하는 최고의 박사님!',
    rewardMessage: '모든 친구들이 부러워하는 구구단 박사님 등장!'
  },
  {
    level: 9,
    name: '구구단 마법사',
    icon: '🧙‍♂️',
    minCorrect: 300,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    description: '마법처럼 수식을 풀어내는 구구단 대마법사!',
    rewardMessage: '수리수리 마수리! 모든 문제 정답 완성!'
  },
  {
    level: 10,
    name: '구구단 전설의 신',
    icon: '👑',
    minCorrect: 400,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-300',
    description: '우주 최고! 완벽하고 영원한 구구단의 왕이자 신!',
    rewardMessage: '축하합니다! 당신은 전설 속 구구단의 신입니다!'
  }
];

export function getCurrentRank(totalCorrect: number): Rank {
  let currentRank = RANKS[0];
  for (const r of RANKS) {
    if (totalCorrect >= r.minCorrect) {
      currentRank = r;
    } else {
      break;
    }
  }
  return currentRank;
}

export function getNextRank(totalCorrect: number): { nextRank: Rank | null; remaining: number; progressPercent: number } {
  const currentRank = getCurrentRank(totalCorrect);
  const currentIndex = RANKS.findIndex(r => r.level === currentRank.level);
  
  if (currentIndex === RANKS.length - 1) {
    return { nextRank: null, remaining: 0, progressPercent: 100 };
  }

  const nextRank = RANKS[currentIndex + 1];
  const currentMin = currentRank.minCorrect;
  const targetMin = nextRank.minCorrect;
  const needed = targetMin - currentMin;
  const currentProgress = totalCorrect - currentMin;
  
  const remaining = Math.max(0, targetMin - totalCorrect);
  const progressPercent = Math.min(100, Math.floor((currentProgress / needed) * 100));

  return { nextRank, remaining, progressPercent };
}
