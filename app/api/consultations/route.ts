import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getConsultationsByUserId,
  saveConsultation,
} from "@/app/lib/consultationUtils";
import { ChatMessage } from "@/app/type/types";

// GET: 현재 사용자의 모든 상담 내역 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const consultations = await getConsultationsByUserId(userId);

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("상담 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "상담 내역을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 새로운 상담 내역 저장
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("세션 정보:", session?.user);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const requestData = await req.json();
    const { title, messages, talismanId } = requestData;

    console.log("상담 내역 저장 요청:", {
      userId,
      title,
      messageCount: messages?.length,
      talismanId,
    });

    if (!title || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "제목과 메시지는 필수 항목입니다." },
        { status: 400 }
      );
    }

    const consultation = await saveConsultation(
      userId,
      title,
      messages as ChatMessage[],
      talismanId
    );

    console.log("상담 내역 저장 완료:", consultation);

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("상담 내역 저장 오류:", error);
    return NextResponse.json(
      {
        error: "상담 내역을 저장하는 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
