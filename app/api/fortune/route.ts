import { NextRequest, NextResponse } from 'next/server';
import { getFortuneResponse } from '@/app/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { concern, detailLevel1, detailLevel2, detailLevel3 } = await req.json();
    
    if (!concern || !detailLevel1 || !detailLevel2 || !detailLevel3) {
      return NextResponse.json(
        { error: '고민 유형과 세부 정보가 모두 필요합니다.' },
        { status: 400 }
      );
    }
    
    const fortune = await getFortuneResponse(concern, detailLevel1, detailLevel2, detailLevel3);
    
    return NextResponse.json({ fortune });
  } catch (error) {
    console.error('운세 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '운세를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 