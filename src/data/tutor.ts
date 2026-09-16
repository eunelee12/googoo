export interface TutorCharacter {
  name: string;
  avatar: string;
  greeting: string;
}

export const TUTOR: TutorCharacter = {
  name: '구구 젤리',
  avatar: '🐱',
  greeting: '안녕! 나는 구구단 튜터 구구 젤리야! 나와 함께 신나게 구구단을 정복해볼까?'
};

export const PRAISE_MESSAGES = [
  '우와! 대단해요! 정답이에요! 🎉',
  '완벽해요! 폭죽이 팡팡 터져요! ✨',
  '머리가 샤방샤방! 구구단천재! 🌟',
  '대단한 순발력이에요! 최고! 👍',
  '차근차근 정말 잘 맞히고 있어요! 💖',
  '쿵더덕 쿵덕! 구구단 실력 상승 중! 🚀',
  '정확한 정답! 튜터가 박수를 보내요! 👏'
];

export const ENCOURAGE_MESSAGES = [
  '괜찮아요! 다시 한번 생각해볼까요? 할 수 있어요! 💪',
  '틀려도 괜찮아요! 구구단은 연습하면 무조건 늘어요! 🌱',
  '아쉬워요! 덧셈으로 찬찬히 풀어볼까요? 😊',
  '포기하지 마세요! 튜터가 곁에 있어요! 🧡'
];

export function getRandomPraise(): string {
  const index = Math.floor(Math.random() * PRAISE_MESSAGES.length);
  return PRAISE_MESSAGES[index];
}

export function getRandomEncourage(): string {
  const index = Math.floor(Math.random() * ENCOURAGE_MESSAGES.length);
  return ENCOURAGE_MESSAGES[index];
}

// Generate multiplication visual explanation (repeated addition string & array)
export function getVisualExplanation(num1: number, num2: number): {
  additionStr: string;
  answer: number;
  groups: number[][];
} {
  const answer = num1 * num2;
  const additionParts = Array(num2).fill(num1);
  const additionStr = additionParts.join(' + ');
  const groups = Array.from({ length: num2 }, () => Array(num1).fill(1));

  return { additionStr, answer, groups };
}
