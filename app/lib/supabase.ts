// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 싱글톤 인스턴스
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL 또는 API 키가 설정되지 않았습니다.");
  }

  // 이미 생성된 인스턴스가 있으면 재사용
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 새 인스턴스 생성
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
};
