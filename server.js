/**
 * 로컬 개발용 Express 서버 (server.js)
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const analyzeHandler = require("./api/analyze");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 정적 파일 서비스 (public 폴더 제거 후 루트에서 직접 서비스)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));

// API 라우트 연결
app.post("/api/analyze", analyzeHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 AI Sentiment Analyzer 서버가 시작되었습니다!`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`================================================`);
});
