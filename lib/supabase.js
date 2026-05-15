/**
 * Supabase 클라이언트 설정 (lib/supabase.js)
 */
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("⚠️ Supabase 환경 변수가 설정되지 않았습니다.");
}

// 서버 단에서만 사용하므로 Service Role Key를 사용합니다.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
