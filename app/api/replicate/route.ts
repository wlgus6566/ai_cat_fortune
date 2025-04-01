import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: NextRequest) {
  console.log("API 요청 받음: /api/replicate");

  try {
    const body = await req.json();
    console.log("요청 본문:", body);

    const { prompt } = body;

    if (!prompt) {
      console.log("프롬프트 누락 오류");
      return NextResponse.json(
        { error: "이미지 생성을 위한 프롬프트가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("프롬프트 확인됨:", prompt.substring(0, 100) + "...");
    console.log("API 토큰 존재 여부:", !!process.env.REPLICATE_API_TOKEN);

    // Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log("Replicate 클라이언트 초기화 완료");

    // Stable Diffusion 모델 실행
    console.log("모델 실행 시작: black-forest-labs/flux-schnell");
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: prompt,
        aspect_ratio: "9:16",
        num_outputs: 1,
        go_fast: true,
        megapixels: "1",
        output_format: "webp",
        output_quality: 90,
        negative_prompt:
          "blurry, low quality, distorted, deformed, text in image that is unreadable or messy, misaligned features", // 품질 향상을 위한 네거티브 프롬프트 추가
      },
    });

    console.log(
      "모델 실행 완료, 출력 데이터:",
      output ? "데이터 있음" : "데이터 없음"
    );

    return NextResponse.json({ output });
  } catch (error) {
    console.error("이미지 생성 중 오류 발생:", error);
    // 오류 객체의 더 자세한 정보 출력
    if (error instanceof Error) {
      console.error("오류 이름:", error.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
    }

    return NextResponse.json(
      { error: "이미지를 생성하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
