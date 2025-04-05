import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 생성
const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { userId } = context.params;

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Supabase에서 사용자 프로필 가져오기
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "user_profiles 테이블이 존재하지 않습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: `사용자 프로필을 가져오는 중 오류가 발생했습니다: ${error.message}`,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "사용자 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 성공 응답
    return NextResponse.json({
      profile: {
        id: data.id,
        userId: data.id,
        name: data.name || "",
        gender: data.gender || null,
        birthDate: data.birth_date || "",
        calendarType: data.calendar_type || null,
        birthTime: data.birth_time || "모름",
        profileImageUrl: data.profile_image_url || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: unknown) {
    console.error("API 오류:", error);
    return NextResponse.json(
      {
        error: `서버 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`,
      },
      { status: 500 }
    );
  }
}
