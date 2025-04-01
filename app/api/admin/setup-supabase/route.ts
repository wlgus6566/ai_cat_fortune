import { NextResponse } from "next/server";
import { setupSupabase } from "@/app/lib/supabaseSetup";

export async function POST() {
  try {
    const setupResult = await setupSupabase();
    return NextResponse.json(setupResult);
  } catch (error) {
    console.error("Supabase 초기 설정 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Supabase 초기 설정 중 오류가 발생했습니다.",
        message: "초기 설정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
