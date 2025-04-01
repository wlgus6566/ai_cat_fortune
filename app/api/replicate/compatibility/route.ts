import { NextResponse } from "next/server";
import Replicate from "replicate";

// Replicate 클라이언트 초기화
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    console.log("궁합 카드 생성 API 호출됨");

    // 요청 데이터 파싱
    const { prompt } = await request.json();
    console.log("요청 본문:", { prompt: prompt.substring(0, 100) + "..." });

    // 입력값 검증
    if (!prompt) {
      console.log("프롬프트 누락 오류");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PROMPT",
            message: "프롬프트가 없거나 길이 제한을 초과했습니다.",
          },
        },
        { status: 400 }
      );
    }

    console.log("프롬프트 확인됨");
    console.log("API 토큰 존재 여부:", !!process.env.REPLICATE_API_TOKEN);

    // Replicate API 호출
    console.log("모델 실행 시작: black-forest-labs/flux-schnell");
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        prompt: prompt,
        go_fast: true,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
        negative_prompt:
          "blurry, low quality, distorted, deformed, text in image that is unreadable or messy, misaligned features",
      },
    });

    console.log("Replicate 이미지 생성 요청 완료:", prediction.id);

    // 이미지 생성 상태 확인을 위한 폴링
    let finalPrediction = prediction;
    let retryCount = 0;
    const maxRetries = 30; // 최대 30초 대기

    while (
      finalPrediction.status !== "succeeded" &&
      finalPrediction.status !== "failed" &&
      retryCount < maxRetries
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      finalPrediction = await replicate.predictions.get(prediction.id);
      console.log(
        `폴링 ${retryCount + 1}/${maxRetries}: 상태=${finalPrediction.status}`
      );
      retryCount++;
    }

    // 타임아웃 또는 생성 실패 시
    if (retryCount >= maxRetries || finalPrediction.status === "failed") {
      console.error("이미지 생성 실패 또는 타임아웃:", finalPrediction);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GENERATION_FAILED",
            message:
              retryCount >= maxRetries
                ? "이미지 생성 시간이 초과되었습니다."
                : "이미지 생성에 실패했습니다.",
          },
        },
        { status: 500 }
      );
    }

    // Replicate에서 생성된 이미지 URL
    const replicateImageUrl = finalPrediction.output[0];
    console.log("Replicate 이미지 생성 성공:", replicateImageUrl);

    // 성공 응답
    return NextResponse.json({
      success: true,
      output: [replicateImageUrl],
    });
  } catch (error) {
    console.error("이미지 생성 중 오류 발생:", error);
    // 오류 객체의 더 자세한 정보 출력
    if (error instanceof Error) {
      console.error("오류 이름:", error.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "서버 오류가 발생했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
