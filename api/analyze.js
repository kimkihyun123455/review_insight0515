/**
 * 04. 백엔드 API 구현 (api/analyze.js)
 * Step 6: Supabase 연동 및 암호화 로직 추가
 */
const { OpenAI } = require("openai");
const supabase = require("../lib/supabase");
const { encrypt } = require("../lib/crypto");

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// sentiment -> sentimentLabel 변환 맵
const sentimentLabelMap = {
  positive: "긍정",
  negative: "부정",
  neutral: "중립"
};

/**
 * 감성 분석 처리 함수
 */
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "허용되지 않는 메서드입니다." });
  }

  const { text } = req.body;

  // 1. 입력값 검증
  if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "분석할 텍스트를 입력해주세요." });
  }

  if (text.length > 1000) {
    return res.status(400).json({ success: false, message: "텍스트는 최대 1,000자까지 입력할 수 있습니다." });
  }

  try {
    // 2. OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `당신은 한국어 텍스트의 감성을 분석하는 AI입니다.
입력 문장을 positive, negative, neutral 중 하나로 분류하세요.
반드시 JSON 형식으로만 응답하세요.
confidence는 0부터 100 사이의 정수입니다.
reason은 한국어 2~3문장으로 작성하세요.`
        },
        {
          role: "user",
          content: `다음 텍스트의 감성을 분석하세요.\n\n텍스트:\n${text}\n\n응답 형식:\n{\n  "sentiment": "positive | negative | neutral",\n  "confidence": 0-100,\n  "reason": "분석 이유 2~3문장"\n}`
        }
      ],
      response_format: { type: "json_object" }
    });

    // 3. AI 응답 파싱
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    // 4. 응답 데이터 정규화
    const resultData = {
      sentiment: aiResponse.sentiment,
      sentimentLabel: sentimentLabelMap[aiResponse.sentiment] || "알 수 없음",
      confidence: aiResponse.confidence,
      reason: aiResponse.reason
    };

    // 5. [보안 강화] 입력 텍스트 암호화
    const encryptedText = encrypt(text);

    // 6. Supabase에 결과 저장
    try {
      const { error } = await supabase
        .from("sentiment_analyses")
        .insert([
          {
            input_text: encryptedText, // 암호화하여 저장
            sentiment: resultData.sentiment,
            sentiment_label: resultData.sentimentLabel,
            confidence: resultData.confidence,
            reason: resultData.reason
          }
        ]);

      if (error) {
        console.error("Supabase Save Error:", error.message);
        // 저장 실패가 사용자 분석 결과 확인을 방해하지 않도록 함 (04_BACKEND_API.md 준수)
      }
    } catch (dbError) {
      console.error("Database Connection Error:", dbError);
    }

    // 7. 분석 결과 반환
    return res.status(200).json({
      success: true,
      data: resultData
    });

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({
      success: false,
      message: "감성 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
    });
  }
}

module.exports = handler;
