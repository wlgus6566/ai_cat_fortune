import { NextRequest, NextResponse } from 'next/server';
import { generateTalismanImage } from '@/app/lib/replicate';

// API 응답 타입 정의
interface ApiResponse {
  error?: boolean;
  message?: string;
  imageUrl?: string;
}

interface RequestBody {
  concern: string;
  userName?: string;
}

/**
 * 부적 이미지 생성 API 핸들러
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 검증
    const body = await request.json();
    const { concern, userName } = validateRequestBody(body);
    
    // 부적 이미지 생성
    const imageUrl = await generateTalismanImage(concern, userName);
    
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * 요청 데이터 검증
 */
function validateRequestBody(body: RequestBody): { concern: string; userName?: string } {
  const { concern, userName } = body;
  
  if (!concern || typeof concern !== 'string') {
    throw new Error('고민 내용이 필요합니다.');
  }
  
  if (userName && typeof userName !== 'string') {
    throw new Error('사용자 이름이 올바르지 않습니다.');
  }
  
  return { concern, userName };
}

/**
 * API 에러 처리
 */
function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('부적 이미지 생성 API 오류:', error);
  
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  
  // HTTP 상태 코드 결정
  let status = 500;
  if (message.includes('결제 정보')) {
    status = 402;
  } else if (message.includes('고민 내용') || message.includes('사용자 이름')) {
    status = 400;
  }
  
  return NextResponse.json(
    { error: true, message },
    { status }
  );
} 