import { createClient } from '@supabase/supabase-js';

// Supabase 환경변수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성 함수
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// 서버에서만 사용하는 Supabase 클라이언트
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
); 