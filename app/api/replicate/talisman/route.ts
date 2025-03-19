import { NextRequest, NextResponse } from 'next/server';
import { generateTalismanImage } from '@/app/lib/replicate';

export async function POST(req: NextRequest) {
  try {
    const { concern } = await req.json();
    
    if (!concern) {
      return NextResponse.json(
        { error: '부적 이미지 생성을 위한 고민 내용이 필요합니다.' },
        { status: 400 }
      );
    }
    
    console.log('부적 API 요청 받음:', concern);
    
    // 부적 이미지 생성
    const imageUrl = await generateTalismanImage(concern);
    
    console.log('부적 API 생성 결과:', imageUrl);
    
    if (!imageUrl) {
      // 이미지 생성 실패 원인에 대한 더 자세한 정보 제공
      console.log('부적 이미지 생성 실패: imageUrl이 null입니다');
      return NextResponse.json(
        { 
          error: '이미지 생성 실패', 
          message: '부적 이미지를 생성하지 못했습니다. Replicate API를 사용하기 위해서는 결제 정보가 필요합니다. https://replicate.com/account/billing 에서 결제 정보를 설정하세요.'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('부적 이미지 생성 중 오류 발생:', err.message, err.stack);
    return NextResponse.json(
      { 
        error: '부적 이미지를 생성하는 중 오류가 발생했습니다.',
        message: 'Replicate API 사용 시 결제 정보가 필요합니다. https://replicate.com/account/billing 에서 결제 정보를 설정하세요.',
        detail: err.message
      },
      { status: 500 }
    );
  }
} 