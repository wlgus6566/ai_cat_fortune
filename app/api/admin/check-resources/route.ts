import { NextResponse } from "next/server";
import { checkSupabaseResources } from "@/app/lib/supabaseSetup";

export async function GET() {
  try {
    const resourcesStatus = await checkSupabaseResources();
    return NextResponse.json(resourcesStatus);
  } catch (error) {
    console.error("자원 상태 확인 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "자원 상태 확인 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
