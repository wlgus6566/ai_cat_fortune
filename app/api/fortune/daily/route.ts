import { NextRequest, NextResponse } from 'next/server';
import { getDailyFortune } from '@/app/lib/openai';
import { UserProfile } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const { userName, userProfile } = body as {
      userName?: string;
      userProfile?: UserProfile;
    };
    
    // 사용자 프로필 확인
    if (!userProfile) {
      return NextResponse.json(
        { 
          error: true, 
          message: '사용자 프로필 정보가 필요합니다.' 
        },
        { status: 400 }
      );
    }
    
    // 오늘의 운세 데이터 가져오기
    const dailyFortune = await getDailyFortune(userName, userProfile);
    
    // 응답 반환
    return NextResponse.json({
      error: false,
      data: dailyFortune
    });
  } catch (error) {
    console.error('오늘의 운세 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: true, 
        message: '운세 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      },
      { status: 500 }
    );
  }
} 