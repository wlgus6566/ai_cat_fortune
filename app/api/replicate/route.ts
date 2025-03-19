import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: '이미지 생성을 위한 프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    // Stable Diffusion 모델 실행
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80
        },
      }
    );
    
    return NextResponse.json({ output });
  } catch (error) {
    console.error('이미지 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '이미지를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 