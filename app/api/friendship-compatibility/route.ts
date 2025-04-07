import { NextRequest } from "next/server";
import { handleCompatibilityRequest } from "@/app/lib/compatibilityUtils";
import { friendCompatibilityPrompt } from "@/app/lib/compatibilityPrompts";

/**
 * API 라우트: 두 사람의 친구 궁합을 분석하는 엔드포인트
 */
export async function POST(request: NextRequest) {
  const data = await request.json();
  return handleCompatibilityRequest(data, friendCompatibilityPrompt);
}
