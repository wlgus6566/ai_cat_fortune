-- user_profiles 테이블 생성

-- 1. 테이블이 이미 존재하는 경우 드롭
DROP TABLE IF EXISTS public.user_profiles;

-- 2. 새 테이블 생성
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  gender TEXT,
  birth_date TEXT,
  calendar_type TEXT,
  birth_time TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. 테이블 권한 설정
-- 익명 사용자 읽기 권한
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 자신의 프로필만 읽기 가능한 정책
CREATE POLICY "사용자는 자신의 프로필만 읽을 수 있음" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 자신의 프로필만 생성 가능한 정책
CREATE POLICY "사용자는 자신의 프로필만 생성할 수 있음" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 자신의 프로필만 업데이트 가능한 정책
CREATE POLICY "사용자는 자신의 프로필만 업데이트할 수 있음" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 자신의 프로필만 삭제 가능한 정책
CREATE POLICY "사용자는 자신의 프로필만 삭제할 수 있음" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id); 