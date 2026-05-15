-- 05. Supabase 테이블 생성 쿼리 (supabase/migrations/001_create_sentiment_analyses_table.sql)

-- 테이블 생성
create table sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  input_text text not null, -- 암호화된 텍스트가 저장됩니다.
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  sentiment_label text not null check (sentiment_label in ('긍정', '부정', '중립')),
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  reason text not null,
  created_at timestamptz not null default now()
);

-- 검색 성능 향상을 위한 인덱스 생성
create index sentiment_analyses_created_at_idx on sentiment_analyses (created_at desc);
create index sentiment_analyses_sentiment_idx on sentiment_analyses (sentiment);

-- RLS(Row Level Security) 설정 (서버 API에서만 접근하므로 클라이언트 직접 접근 제한 권장)
alter table sentiment_analyses enable row level security;

-- 서버 사이드에서만 접근 가능하도록 정책 설정 (필요 시)
-- create policy "Allow server-side inserts" on sentiment_analyses for insert with check (true);
