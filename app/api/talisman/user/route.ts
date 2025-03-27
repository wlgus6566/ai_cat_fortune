import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTalismansByUserId } from "@/app/lib/talismanUtils";

/**
 * 사용자의 부적 이미지 목록 조회 API
 */
export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // URL 쿼리 파라미터에서 userId 가져오기
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 사용자와 요청된 사용자가 다른 경우 (관리자 확인 로직이 필요할 수 있음)
    /*
    if (userId !== session.user.id) {
      // 관리자 권한 확인 로직이 필요할 수 있음
      // 현재는 보안상 자신의 부적만 볼 수 있도록 제한
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    */

    // 부적 목록 조회
    const talismans = await getTalismansByUserId(userId);
    console.log("talismans444445555", talismans);

    return NextResponse.json({ talismans });
  } catch (error) {
    console.error("사용자 부적 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "사용자 부적 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
