import { NextRequest, NextResponse } from 'next/server';
import { getFortuneResponse } from '@/app/lib/openai';
import { ConcernType, UserProfile } from '@/app/type/types';

export async function POST(request: NextRequest) {
  try {
    const { concern, detailLevel1, detailLevel2, detailLevel3, userName, userProfile } = await request.json();
    
    if (!concern || !detailLevel1 || !detailLevel2 || !detailLevel3) {
      return NextResponse.json(
        { error: '모든 상세 정보가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const fortune = await getFortuneResponse(
      concern as ConcernType,
      detailLevel1,
      detailLevel2,
      detailLevel3,
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