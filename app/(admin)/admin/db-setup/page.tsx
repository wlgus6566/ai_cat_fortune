"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/app/lib/supabase";
import { setupSupabase, checkSupabaseResources } from "@/app/lib/supabaseSetup";

// SQL 쿼리 문자열
const CREATE_USER_PROFILES_SQL = `
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
);
`;

const CREATE_TALISMANS_SQL = `
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
);
`;

// 리소스 상태를 위한 타입 정의
interface ResourceStatus {
  userProfilesTable: boolean;
  talismansTable: boolean;
  talismansBucket: boolean;
  details: string;
}

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [resources, setResources] = useState<ResourceStatus | null>(null);

  // Supabase 자원 상태 확인
  const checkResources = async () => {
    setLoading(true);
    setResult(null);

    try {
      const resourcesStatus = await checkSupabaseResources();
      setResources(resourcesStatus);

      setResult({
        success: true,
        message: "자원 상태 확인 완료",
      });
    } catch (error) {
      setResult({
        success: false,
        message:
          "자원 상태 확인 중 오류 발생: " +
          (error instanceof Error ? error.message : String(error)),
      });
    } finally {
      setLoading(false);
    }
  };

  // Supabase 초기 설정 실행
  const runSetup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const setupResult = await setupSupabase();

      setResult({
        success: setupResult.success,
        message: setupResult.message,
      });

      // 설정 후 자원 상태 다시 확인
      if (setupResult.success) {
        await checkResources();
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          "초기 설정 중 오류 발생: " +
          (error instanceof Error ? error.message : String(error)),
      });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 생성 쿼리 복사
  const copyCreateTablesSQL = () => {
    const sql = CREATE_USER_PROFILES_SQL + "\n" + CREATE_TALISMANS_SQL;
    navigator.clipboard.writeText(sql);

    setResult({
      success: true,
      message:
        "SQL 쿼리가 클립보드에 복사되었습니다. Supabase SQL 에디터에 붙여넣어 직접 실행하세요.",
    });
  };

  // 테이블 직접 확인
  const checkTables = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = createSupabaseClient();

      // user_profiles 테이블 확인
      const { error: userProfilesError } = await supabase
        .from("user_profiles")
        .select("count")
        .limit(1);

      // talismans 테이블 확인
      const { error: talismansError } = await supabase
        .from("talismans")
        .select("count")
        .limit(1);

      setResult({
        success: !userProfilesError && !talismansError,
        message: `테이블 상태:
- user_profiles: ${
          userProfilesError
            ? "없음 또는 오류 (" + userProfilesError.message + ")"
            : "존재함"
        }
- talismans: ${
          talismansError
            ? "없음 또는 오류 (" + talismansError.message + ")"
            : "존재함"
        }`,
      });
    } catch (error) {
      setResult({
        success: false,
        message:
          "테이블 확인 중 오류 발생: " +
          (error instanceof Error ? error.message : String(error)),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Supabase 설정</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={checkResources}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50 transition-colors"
          >
            Supabase 자원 상태 확인
          </button>

          <button
            onClick={runSetup}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            Supabase 초기 설정 실행
          </button>

          <button
            onClick={copyCreateTablesSQL}
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 disabled:opacity-50 transition-colors"
          >
            테이블 생성 SQL 복사
          </button>

          <button
            onClick={checkTables}
            disabled={loading}
            className="w-full py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50 transition-colors"
          >
            테이블 직접 확인
          </button>
        </div>

        {loading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {resources && (
          <div className="p-4 rounded-md bg-gray-50 text-gray-800 mb-4">
            <h2 className="font-semibold mb-2">자원 상태:</h2>
            <pre className="whitespace-pre-wrap text-sm">
              {resources.details}
            </pre>
          </div>
        )}

        {result && (
          <div
            className={`p-4 rounded-md ${
              result.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <pre className="whitespace-pre-wrap text-sm">{result.message}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
