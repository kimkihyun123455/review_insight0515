/**
 * 보안 강화를 위한 데이터 암호화 유틸리티 (lib/crypto.js)
 */
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32자여야 함
const IV_LENGTH = 16; // AES 알고리즘을 위한 초기화 벡터 길이

/**
 * 텍스트 암호화 함수
 */
function encrypt(text) {
  if (!ENCRYPTION_KEY) {
    throw new Error("암호화 키(ENCRYPTION_KEY)가 설정되지 않았습니다.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // iv와 암호화된 데이터를 결합하여 반환 (저장 시 필요)
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * 텍스트 복호화 함수 (필요 시 사용)
 */
function decrypt(text) {
  if (!ENCRYPTION_KEY) {
    throw new Error("암호화 키(ENCRYPTION_KEY)가 설정되지 않았습니다.");
  }

  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
