import { NextRequest, NextResponse } from 'next/server';
import { getFortuneResponse } from '@/app/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { concern, subConcern } = await req.json();
    
    if (!concern || !subConcern) {
      return NextResponse.json(
        { error: '고민 유형과 세부 고민이 필요합니다.' },
        { status: 400 }
      );
    }
    
    const fortune = await getFortuneResponse(concern, subConcern);
    
    return NextResponse.json({ fortune });
  } catch (error) {
    console.error('운세 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '운세를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 