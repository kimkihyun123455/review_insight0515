/**
 * 03. 프론트엔드 기능 구현 (js/app.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM 요소 선택 ---
  const sentimentText = document.querySelector("#sentimentText");
  const analyzeButton = document.querySelector("#analyzeButton");
  const charCount = document.querySelector("#charCount");
  const errorMessage = document.querySelector("#errorMessage");

  const resultModalBackdrop = document.querySelector("#resultModalBackdrop");
  const modalCloseButton = document.querySelector("#modalCloseButton");
  const modalConfirmButton = document.querySelector("#modalConfirmButton");

  const resultLabel = document.querySelector("#resultLabel");
  const resultConfidence = document.querySelector("#resultConfidence");
  const resultReason = document.querySelector("#resultReason");

  // 감성별 색상 매핑
  const sentimentColors = {
    positive: "#00754A",
    negative: "#c82014",
    neutral: "rgba(0,0,0,0.58)"
  };

  // --- 기능 1. 글자 수 실시간 업데이트 ---
  sentimentText.addEventListener("input", () => {
    const length = sentimentText.value.length;
    charCount.textContent = `${length.toLocaleString()} / 1,000`;

    // 1,000자 초과 시 스타일 경고 (HTML maxlength="1000"이 이미 차단하지만 시각적 피드백 제공)
    if (length >= 1000) {
      charCount.style.color = "var(--color-error)";
    } else {
      charCount.style.color = "var(--color-text-sub)";
    }

    // 에러 메시지 초기화
    if (length > 0) {
      errorMessage.textContent = "";
    }
  });

  // --- 기능 2. 감성 분석 버튼 클릭 핸들러 ---
  analyzeButton.addEventListener("click", async () => {
    const text = sentimentText.value.trim();

    // 입력값 검증 (03_FRONTEND_FEATURES.md 참조)
    if (!text) {
      errorMessage.textContent = "분석할 텍스트를 입력해주세요.";
      sentimentText.focus();
      return;
    }

    if (text.length > 1000) {
      errorMessage.textContent = "텍스트는 최대 1,000자까지 입력할 수 있습니다.";
      return;
    }

    // 로딩 상태 시작
    setLoading(true);
    errorMessage.textContent = "";

    try {
      // API 호출
      const data = await analyzeSentiment(text);

      // 결과 표시
      displayResult(data);
    } catch (error) {
      console.error("Analysis Error:", error);
      errorMessage.textContent = error.message || "서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.";
    } finally {
      // 로딩 상태 종료
      setLoading(false);
    }
  });

  // --- 기능 3. API 요청 함수 ---
  async function analyzeSentiment(text) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "감성 분석 중 문제가 발생했습니다.");
    }

    return result.data;
  }

  // --- 기능 4. 로딩 상태 UI 제어 ---
  function setLoading(isLoading) {
    if (isLoading) {
      analyzeButton.disabled = true;
      analyzeButton.textContent = "분석 중...";
      analyzeButton.style.opacity = "0.7";
    } else {
      analyzeButton.disabled = false;
      analyzeButton.textContent = "감성분석";
      analyzeButton.style.opacity = "1";
    }
  }

  // --- 기능 5. 결과 데이터 바인딩 및 모달 열기 ---
  function displayResult(data) {
    const { sentiment, sentimentLabel, confidence, reason } = data;

    // 데이터 바인딩
    resultLabel.textContent = sentimentLabel;
    resultLabel.style.color = sentimentColors[sentiment] || "#000";
    resultConfidence.textContent = `신뢰도 ${confidence}%`;
    resultReason.textContent = reason;

    // 모달 표시
    resultModalBackdrop.classList.add("active");
  }

  // --- 기능 6. 모달 닫기 로직 ---
  function closeModal() {
    resultModalBackdrop.classList.remove("active");
  }

  // 닫기 버튼 클릭
  modalCloseButton.addEventListener("click", closeModal);
  // 확인 버튼 클릭
  modalConfirmButton.addEventListener("click", closeModal);

  // 모달 바깥 영역 클릭 시 닫기
  resultModalBackdrop.addEventListener("click", (e) => {
    if (e.target === resultModalBackdrop) {
      closeModal();
    }
  });

  // ESC 키 입력 시 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && resultModalBackdrop.classList.contains("active")) {
      closeModal();
    }
  });
});
