import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getConsultationById,
  deleteConsultation,
} from "@/app/lib/consultationUtils";

// GET: 특정 상담 내역 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "상담 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const consultation = await getConsultationById(id);

    if (!consultation) {
      return NextResponse.json(
        { error: "상담 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 자신의 상담 내역만 조회 가능
    if (consultation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("상담 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "상담 내역을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 특정 상담 내역 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "상담 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const deletedConsultation = await deleteConsultation(id, userId);

    if (!deletedConsultation) {
      return NextResponse.json(
        { error: "상담 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "상담 내역이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("상담 내역 삭제 오류:", error);
    return NextResponse.json(
      { error: "상담 내역을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
