import { NextRequest, NextResponse } from 'next/server';
import { getDirectFortuneResponse } from '@/app/lib/openai';
import { UserProfile } from '@/app/type/types';

export async function POST(request: NextRequest) {
  try {
    const { userQuery, userName, userProfile } = await request.json();
    
    if (!userQuery) {
      return NextResponse.json(
        { error: '질문이 필요합니다.' },
        { status: 400 }
      );
    }
    
    const fortune = await getDirectFortuneResponse(
      userQuery,
      userName,
      userProfile as UserProfile | null
    );
    
    return NextResponse.json({ fortune });
  } catch (error) {
    console.error('운세 생성 오류:', error);
    return NextResponse.json(
      { error: '운세를 생성하는 데 실패했습니다.' },
      { status: 500 }
    );
  }
} 