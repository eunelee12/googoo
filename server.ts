import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for Tutor Chat
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { studentName, messages, solvedCount } = req.body;

    const ai = getGeminiAI();

    const systemInstruction = `
당신은 초등학생을 위한 귀엽고 친절한 '구구단 요정 튜터'입니다.
학생 이름: ${studentName || '친구'}
현재까지 해결한 실생활 구구단 문제 수: ${solvedCount || 0} / 3

[원칙과 역할]
1. 항상 따뜻하고 친근하며 격려하는 한국어로 대화하세요 (~해요, ~해볼까요?, 칭찬과 이모지 적극 활용!).
2. 구구단에 대한 궁금증(외우는 방법, 단의 개념, 구구단 규칙 등)에 친절하고 쉽게 설명해 주세요.
3. 실생활과 연관된 구구단 응용 문제(예: "한 상자에 귤이 3개씩 4상자 있으면 모두 몇 개일까?")를 제시하거나, 학생이 제시한 상황으로 함께 문제를 풀어가세요.
4. 문제를 다룰 때 바로 정답을 구하라고 하지 말고, "3을 4번 더해보면 얼마일까?" 같이 힌트 질문을 던져서 학생 스스로 답을 찾을 수 있게 차근차근 이끌어 주세요.
5. 학생이 정답이나 답을 바로 알려달라고 요청하는 경우 ("답 알려줘", "답이 뭐야?"):
   - "답을 바로 알려주면 스스로 해결했을 때의 멋진 기분을 맛볼 수 없어요! 힌트를 줄 테니 차근차근 함께 풀어볼까요? 😊" 하고 정중히 거절한 뒤 힌트를 제공하세요.
6. 학생이 구구단 이외의 주제(잡담, 시사, 정치, 상담, 다른 과목, 게임 등)를 말하면:
   - 다정하게 구구단 이야기로 돌아오도록 유도해 주세요.
   - 단! 입력한 내용이 구구단 문제와 연결될 수 있는 실생활 이야기(예: "나 오늘 과자 3봉지 먹었어")인 경우에는 "우와 과자 3봉지! 만약 한 봉지에 과자가 5개씩 들어있었다면 몇 개일까?"처럼 구구단 응용 문제로 자연스럽게 이끌어 대화를 계속 이어가세요.
7. 학생이 대화 도중 제시된 실생활 구구단 문제의 정답을 올바르게 맞혔다면:
   - 크게 칭찬해 주고, 이번 턴의 isProblemSolved를 true로 설정하세요.
8. 만약 이번 문제 맞춤으로 인해 실생활 구구단 문제를 총 3개 완료하게 되는 경우 (또는 solvedCount가 2에서 3이 됨):
   - "우와! 실생활 구구단 응용 문제 3개를 모두 완벽하게 해결했어요! 🏆 정말 자랑스러워요! 대화를 마치고 구구단 연습 메뉴로 돌아갈게요!" 하고 대화를 기분 좋게 마무리하세요. isFinished를 true로 설정하세요.

[JSON 응답 형식을 엄격히 준수하세요]
- reply: 학생에게 보낼 대화 메시지
- isProblemSolved: 이번 대화 턴에서 학생이 실생활 구구단 응용 문제의 정답을 맞혀서 문제 1개를 완성했으면 true, 아니면 false
- isFinished: 3문제를 모두 완료하여 대화를 마무리하고 연습 메뉴로 돌아갈 시점이면 true, 아니면 false
`;

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: '학생에게 전달할 친절한 튜터 답변',
            },
            isProblemSolved: {
              type: Type.BOOLEAN,
              description: '이번 턴에서 실생활 구구단 문제를 해결했는지 여부',
            },
            isFinished: {
              type: Type.BOOLEAN,
              description: '3문제를 완료하여 대화를 종료할지 여부',
            },
          },
          required: ['reply', 'isProblemSolved', 'isFinished'],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { reply: responseText, isProblemSolved: false, isFinished: false };
    }

    res.json({
      reply: parsed.reply || '구구단에 대해 궁금한 점이나 함께 문제를 풀어볼까요?',
      isProblemSolved: !!parsed.isProblemSolved,
      isFinished: !!parsed.isFinished,
    });
  } catch (err: any) {
    console.error('Tutor chat server error:', err);
    res.status(500).json({
      error: '대화 도중 오류가 발생했습니다.',
      reply: '미안해요! 잠시 대화 연결이 원활하지 않아요. 다시 말씀해 주시겠어요?',
      isProblemSolved: false,
      isFinished: false,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
