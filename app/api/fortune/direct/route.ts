import { NextRequest, NextResponse } from 'next/server';
import { getDirectFortuneResponse } from '@/app/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userQuery } = await req.json();
    
    if (!userQuery) {
      return NextResponse.json(
        { error: '질문 내용이 필요합니다.' },
        { status: 400 }
      );
    }
    
    const fortune = await getDirectFortuneResponse(userQuery);
    
    return NextResponse.json({ fortune });
  } catch (error) {
    console.error('운세 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '운세를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 