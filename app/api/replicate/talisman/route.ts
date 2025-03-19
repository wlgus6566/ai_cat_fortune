import { NextRequest, NextResponse } from 'next/server';
import { generateTalismanImage } from '@/app/lib/replicate';

export async function POST(request: NextRequest) {
  try {
    const { concern, userName } = await request.json();
    
    if (!concern) {
      return NextResponse.json(
        { error: '고민 내용이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 이름을 포함한 부적 이미지 생성
    const namePrefix = userName ? `${userName}님을 위한 ` : '';
    const imageUrl = await generateTalismanImage(`${namePrefix}${concern} 관련 행운의 부적`);
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: '부적 이미지 생성에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('부적 이미지 생성 오류:', error);
    
    // 타입 체크를 통한 에러 메시지 추출
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    if (errorMessage.includes('insufficient credits')) {
      return NextResponse.json(
        { 
          error: true,
          message: '부적 이미지를 생성하기 위한 Replicate API 크레딧이 부족합니다. 결제 정보를 확인해주세요.' 
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { 
        error: true,
        message: '부적 이미지 생성 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 