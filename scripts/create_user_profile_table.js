require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL 또는 서비스 키가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // 테이블이 이미 존재하는지 확인
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');

    if (checkError) {
      console.error('테이블 존재 여부 확인 중 오류 발생:', checkError);
      process.exit(1);
    }

    if (tables && tables.length > 0) {
      console.log('user_profiles 테이블이 이미 존재합니다.');
      return;
    }

    // 테이블 생성 SQL
    const createTableSQL = `
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
    `;

    // SQL 실행
    const { error } = await supabase.rpc('exec', { query: createTableSQL });
    
    if (error) {
      console.error('테이블 생성 중 오류 발생:', error);
      process.exit(1);
    }

    console.log('user_profiles 테이블이 성공적으로 생성되었습니다.');
  } catch (err) {
    console.error('예상치 못한 오류가 발생했습니다:', err);
    process.exit(1);
  }
}

main(); 