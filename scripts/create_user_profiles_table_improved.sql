-- user_profiles 테이블 생성 스크립트 (Supabase SQL 에디터에서 실행)

-- 1. 테이블이 이미 존재하는 경우 드롭 (필요한 경우에만 사용)
DROP TABLE IF EXISTS public.user_profiles;

-- 2. user_profiles 테이블 생성
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
-- RLS(Row Level Security) 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 행만 조회할 수 있는 정책
CREATE POLICY "사용자는 자신의 프로필을 조회할 수 있음" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 모든 사용자가 자신의 행만 삽입할 수 있는 정책
CREATE POLICY "사용자는 자신의 프로필을 생성할 수 있음" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 모든 사용자가 자신의 행만 업데이트할 수 있는 정책
CREATE POLICY "사용자는 자신의 프로필을 업데이트할 수 있음" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 모든 사용자가 자신의 행만 삭제할 수 있는 정책
CREATE POLICY "사용자는 자신의 프로필을 삭제할 수 있음" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- 서비스 롤 또는 관리자에게 full access 권한 부여 (필요한 경우)
CREATE POLICY "서비스 롤은 모든 프로필에 접근할 수 있음" ON public.user_profiles
  USING (auth.role() = 'service_role');

-- 4. 인덱스 생성 (성능 최적화를 위해)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles (id);

-- 5. 초기 데이터 삽입 예시 (필요한 경우)
/*
INSERT INTO public.user_profiles (id, name, gender, birth_date, calendar_type, birth_time)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '테스트 사용자', '남성', '2000-01-01', '양력', '모름');
*/

-- 6. 테이블 주석 추가
COMMENT ON TABLE public.user_profiles IS '사용자 프로필 정보 테이블';
COMMENT ON COLUMN public.user_profiles.id IS '사용자 ID (UUID)';
COMMENT ON COLUMN public.user_profiles.name IS '사용자 이름';
COMMENT ON COLUMN public.user_profiles.gender IS '성별 (남성/여성)';
COMMENT ON COLUMN public.user_profiles.birth_date IS '생년월일 (YYYY-MM-DD)';
COMMENT ON COLUMN public.user_profiles.calendar_type IS '음/양력';
COMMENT ON COLUMN public.user_profiles.birth_time IS '태어난 시간';
COMMENT ON COLUMN public.user_profiles.profile_image_url IS '프로필 이미지 URL';
COMMENT ON COLUMN public.user_profiles.created_at IS '생성 시간';
COMMENT ON COLUMN public.user_profiles.updated_at IS '마지막 업데이트 시간'; 