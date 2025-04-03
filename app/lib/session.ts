import { cookies } from "next/headers";

/**
 * 세션 ID를 가져오는 함수
 *
 * 쿠키에서 세션 ID를 가져옵니다.
 * 세션이 없는 경우 null을 반환합니다.
 */
export async function getSessionId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      console.error("세션 ID가 없습니다.");
      return null;
    }

    return sessionId;
  } catch (error) {
    console.error("세션 ID 가져오기 오류:", error);
    return null;
  }
}
