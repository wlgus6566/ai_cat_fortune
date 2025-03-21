import { NextRequest, NextResponse } from 'next/server';
import { getUserTalismans } from '@/app/lib/storage';

/**
 * 사용자의 부적 이미지 목록 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 userId 파라미터 추출
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: true, message: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자의 부적 이미지 목록 조회
    const talismans = await getUserTalismans(userId);
    
    return NextResponse.json({ talismans });
    
  } catch (error) {
    console.error('사용자 부적 조회 API 오류:', error);
    
    const message = error instanceof Error 
      ? error.message 
      : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { error: true, message },
      { status: 500 }
    );
  }
} 