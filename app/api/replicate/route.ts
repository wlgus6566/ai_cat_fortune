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
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: prompt,
          image_dimensions: "512x512",
          num_outputs: 1,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: "K_EULER",
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