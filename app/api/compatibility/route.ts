import { NextRequest, NextResponse } from "next/server";
import {
  validateUserData,
  handleCompatibilityRequest,
} from "@/app/lib/compatibility-utils";
import { loveCompatibilityPrompt } from "@/app/lib/compatibility-prompts";

/**
 * API 라우트: 두 사람의 사주 궁합을 분석하는 엔드포인트
 */
export async function POST(request: NextRequest) {
  const data = await request.json();
  return handleCompatibilityRequest(data, loveCompatibilityPrompt);
}
