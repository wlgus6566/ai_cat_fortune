import { createSupabaseClient } from "./supabase";
// 서버에서만 실행되는 코드에서만 db를 import합니다.
// db의 import는 여기에서만 사용하고, 외부에서 직접 사용하지 않도록 합니다.
import { db } from "@/db";
import { userProfilesTable, talismansTable } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Supabase 초기 설정을 수행합니다.
 * - talismans 스토리지 버킷 생성 및 설정
 *
 * 이 함수는 서버에서만 실행되어야 합니다.
 */
export const setupSupabase = async () => {
  // typeof window를 체크하여 브라우저에서 실행되고 있는지 확인
  if (typeof window !== "undefined") {
    return {
      success: false,
      message: "이 함수는 서버에서만 실행할 수 있습니다.",
    };
  }

  try {
    const supabase = createSupabaseClient();

    // Supabase Storage 버킷 생성
    const { error: bucketError } = await supabase.storage.createBucket(
      "talismans",
      {
        public: true, // 공개 접근 가능한 버킷
        fileSizeLimit: 10485760, // 10MB 제한
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
      }
    );

    if (bucketError) {
      // 이미 존재하는 버킷 오류는 무시
      if (!bucketError.message.includes("already exists")) {
        console.error("talismans 버킷 생성 실패:", bucketError);
      }
    }

    return {
      success: true,
      message:
        "Supabase Storage 버킷 설정이 완료되었습니다. 테이블은 DB 마이그레이션을 통해 생성됩니다.",
    };
  } catch (error) {
    console.error("Supabase 설정 중 오류 발생:", error);
    return {
      success: false,
      message: `Supabase 설정 중 오류 발생: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * 현재 설정된 Supabase 리소스 상태를 확인합니다.
 *
 * 이 함수는 서버에서만 실행되어야 합니다.
 */
export const checkSupabaseResources = async () => {
  // typeof window를 체크하여 브라우저에서 실행되고 있는지 확인
  if (typeof window !== "undefined") {
    return {
      userProfilesTable: false,
      talismansTable: false,
      talismansBucket: false,
      details: "이 함수는 서버에서만 실행할 수 있습니다.",
    };
  }

  try {
    const supabase = createSupabaseClient();
    const result = {
      userProfilesTable: false,
      talismansTable: false,
      talismansBucket: false,
      details: "",
    };

    // 테이블 존재 여부 확인
    try {
      // Drizzle을 사용하여 테이블 존재 여부 확인 (예시 쿼리)
      await db
        .select({ count: sql`count(*)` })
        .from(userProfilesTable)
        .limit(1);
      result.userProfilesTable = true;
    } catch (error) {
      console.log("user_profiles 테이블 확인 중 오류:", error);
      result.userProfilesTable = false;
    }

    try {
      await db
        .select({ count: sql`count(*)` })
        .from(talismansTable)
        .limit(1);
      result.talismansTable = true;
    } catch (error) {
      console.log("talismans 테이블 확인 중 오류:", error);
      result.talismansTable = false;
    }

    // 버킷 존재 여부 확인
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (!bucketsError && buckets) {
      result.talismansBucket = buckets.some(
        (bucket) => bucket.name === "talismans"
      );
    }

    // 결과 상세 정보 추가
    const details = [
      `* user_profiles 테이블: ${result.userProfilesTable ? "존재함" : "없음"}`,
      `* talismans 테이블: ${result.talismansTable ? "존재함" : "없음"}`,
      `* talismans 버킷: ${result.talismansBucket ? "존재함" : "없음"}`,
    ];

    result.details = details.join("\n");

    return result;
  } catch (error) {
    console.error("Supabase 리소스 확인 중 오류 발생:", error);

    return {
      userProfilesTable: false,
      talismansTable: false,
      talismansBucket: false,
      details: `오류 발생: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * Drizzle 마이그레이션을 위한 SQL 템플릿
 * 참고용으로만 제공 (실제로는 drizzle-kit을 사용하여 마이그레이션 생성)
 */
export const migrationTemplate = {
  userProfiles: `
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT,
  birth_date TEXT,
  calendar_type TEXT,
  birth_time TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);`,

  talismans: `
CREATE TABLE IF NOT EXISTS talismans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT,
  file_type TEXT,
  concern TEXT,
  concern_type TEXT,
  generated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);`,
};
