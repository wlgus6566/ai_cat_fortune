import { NextResponse } from "next/server";
import Replicate from "replicate";
import { IErrorResponse } from "@/app/type/types";
import { saveTalismanImage } from "@/app/lib/storage";

// Replicate 클라이언트 초기화
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 다양한 부적 프롬프트 템플릿
const talismanTemplates = {
  default: (phrase: string) =>
    `A modern pastel illustration of a Japanese-style lucky charm (omamori) with a cute, chubby cat character. Includes encouraging words: "${phrase}". The charm includes Japanese aesthetic elements, decorative knots, and spiritual symbols. Style: Kawaii, pastel colors, soft edges, warm and magical feeling. Aspect ratio 9:16.`,

  romance: (phrase: string) =>
    `A beautifully designed Japanese love charm (omamori) with heart motifs and soft pink/red colors. Features a cute cat character and romantic symbols. Includes a loving message: "${phrase}". Style: Romantic, dreamy, kawaii, with soft pastel colors. Aspect ratio 9:16.`,

  career: (phrase: string) =>
    `A professional-looking Japanese success charm (omamori) with elements symbolizing career growth and achievement. Features a determined-looking cat character in business attire. Includes a motivational message: "${phrase}". Style: Professional with playful elements, blue and gold color scheme. Aspect ratio 9:16.`,

  money: (phrase: string) =>
    `A prosperity-focused Japanese wealth charm (omamori) with gold coins, money symbols and lucky elements. Features a happy cat character with a coin. Includes a wealth-affirming message: "${phrase}". Style: Abundant, prosperous, with green and gold colors. Aspect ratio 9:16.`,

  psychology: (phrase: string) =>
    `A calming Japanese healing charm (omamori) with elements symbolizing mental peace and balance. Features a meditating cat character with serene expression. Includes a comforting message: "${phrase}". Style: Serene, soothing, with purples and blues. Aspect ratio 9:16.`,

  relationships: (phrase: string) =>
    `A harmonious Japanese friendship charm (omamori) with elements symbolizing connection and social bonds. Features multiple cute cat characters together. Includes a warm message: "${phrase}". Style: Warm, connected, with yellows and oranges. Aspect ratio 9:16.`,

  lifestyle: (phrase: string) =>
    `A balanced Japanese lifestyle charm (omamori) with elements symbolizing harmony and life enjoyment. Features a content cat character engaged in various activities. Includes a positive message: "${phrase}". Style: Harmonious, diverse, with balanced color palette. Aspect ratio 9:16.`,
};

// 응원 메시지 (영어)
const encouragingPhrases: Record<string, string[]> = {
  romance: [
    "Love is blooming for you 🌸",
    "Trust your heart 💖",
    "Romance is in the air 💌",
    "Your love story unfolds 💕",
    "Someone special is thinking of you ✨",
  ],
  career: [
    "Your growth is unstoppable 💼",
    "New opportunities await 🚀",
    "Your talents shine bright 🌟",
    "Step forward with confidence 💪",
    "Success is calling 📈",
  ],
  money: [
    "Abundance flows to you 💰",
    "Your wealth is growing 🍀",
    "Every coin counts ✨",
    "Smart moves bring fortune 🧠",
    "You attract prosperity 🌈",
  ],
  psychology: [
    "Peace begins with you 🧘‍♀️",
    "You are enough 🌿",
    "Let your mind rest ☁️",
    "Breathe. You're doing well 🍃",
    "Healing is happening 🌸",
  ],
  relationships: [
    "You're surrounded by love 💞",
    "True friends see your light 🌟",
    "Your connections are precious 🤝",
    "Kindness comes back to you 💫",
    "Warmth is all around you 🧣",
  ],
  lifestyle: [
    "Live your rhythm 🎵",
    "Balance brings joy ⚖️",
    "Little joys matter 🧸",
    "Slow down and smile 😊",
    "Your path is beautiful 🌈",
  ],
  default: [
    "Magic is all around ✨",
    "Believe in your story 📖",
    "Today holds surprises 🌟",
    "You’ve got this 💫",
    "Shine your light 🌞",
  ],
};

// 카테고리에 맞는 랜덤 응원 메시지 가져오기
function getRandomPhrase(category: string): string {
  // 카테고리 매핑 (영어 및 한글 카테고리 지원)
  const mappedCategory =
    category.toLowerCase().includes("romance") ||
    category.toLowerCase().includes("연애")
      ? "romance"
      : category.toLowerCase().includes("career") ||
        category.toLowerCase().includes("직장") ||
        category.toLowerCase().includes("커리어")
      ? "career"
      : category.toLowerCase().includes("money") ||
        category.toLowerCase().includes("금전") ||
        category.toLowerCase().includes("돈")
      ? "money"
      : category.toLowerCase().includes("psychology") ||
        category.toLowerCase().includes("심리")
      ? "psychology"
      : category.toLowerCase().includes("relationships") ||
        category.toLowerCase().includes("인간관계")
      ? "relationships"
      : category.toLowerCase().includes("lifestyle") ||
        category.toLowerCase().includes("라이프") ||
        category.toLowerCase().includes("생활")
      ? "lifestyle"
      : "default";

  // 해당 카테고리의 문구 배열
  const phrases =
    encouragingPhrases[mappedCategory as keyof typeof encouragingPhrases] ||
    encouragingPhrases.lifestyle;

  // 랜덤 문구 선택
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// 카테고리에 맞는 프롬프트 템플릿 선택
function getTemplateByCategory(category: string): string {
  // 카테고리 매핑 (영어 및 한글 카테고리 지원)
  const mappedCategory =
    category.toLowerCase().includes("romance") ||
    category.toLowerCase().includes("연애")
      ? "romance"
      : category.toLowerCase().includes("career") ||
        category.toLowerCase().includes("직장") ||
        category.toLowerCase().includes("커리어")
      ? "career"
      : category.toLowerCase().includes("money") ||
        category.toLowerCase().includes("금전") ||
        category.toLowerCase().includes("돈")
      ? "money"
      : category.toLowerCase().includes("psychology") ||
        category.toLowerCase().includes("심리")
      ? "psychology"
      : category.toLowerCase().includes("relationships") ||
        category.toLowerCase().includes("인간관계")
      ? "relationships"
      : category.toLowerCase().includes("lifestyle") ||
        category.toLowerCase().includes("라이프") ||
        category.toLowerCase().includes("생활")
      ? "lifestyle"
      : "default";

  const phrase = getRandomPhrase(mappedCategory);

  const templateFn =
    talismanTemplates[mappedCategory as keyof typeof talismanTemplates] ||
    talismanTemplates.default;

  // 템플릿 적용
  return templateFn(phrase);
}

export async function POST(request: Request) {
  try {
    // 요청 데이터 파싱
    const { concern, userName, userId } = await request.json();
    console.log("부적 생성 API 호출:", { concern, userName, userId });

    // 입력값 검증
    if (!concern || !userName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PROMPT",
            message: "The prompt is missing or exceeds length limitations.",
          },
        } as IErrorResponse,
        { status: 400 }
      );
    }

    if (!userId) {
      console.warn(
        "userId가 제공되지 않았습니다. 이미지는 생성되지만 저장되지 않을 수 있습니다."
      );
    }

    // 카테고리 추출 (콤마로 구분된 첫 번째 부분)
    const mainCategory = concern.split(",")[0].trim();

    // 카테고리에 맞는 프롬프트 생성
    const prompt = getTemplateByCategory(mainCategory);
    console.log("이미지 생성 프롬프트:", prompt);

    // Replicate API 호출 시 추가 매개변수 설정
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
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
                ? "Image generation timed out."
                : "Failed to generate image.",
          },
        } as IErrorResponse,
        { status: 500 }
      );
    }

    // Replicate에서 생성된 이미지 URL
    const replicateImageUrl = finalPrediction.output[0];
    console.log("Replicate 이미지 생성 성공:", replicateImageUrl);

    // 메타데이터 설정
    const metadata = {
      concern,
      userName,
      createdAt: new Date().toISOString(),
    };

    // Supabase Storage에 이미지 저장
    let storedImageUrl;
    try {
      console.log("Supabase Storage에 이미지 저장 시도:", { userId });
      storedImageUrl = await saveTalismanImage(
        replicateImageUrl,
        userId,
        metadata
      );
      console.log("부적 이미지 저장 완료:", storedImageUrl);
    } catch (storageError) {
      console.error("부적 이미지 저장 실패:", storageError);
      // 저장 실패해도 원본 이미지는 반환
    }

    // 성공 응답 (원본 URL과 저장된 URL 모두 반환)
    return NextResponse.json({
      success: true,
      imageUrl: replicateImageUrl,
      storedImageUrl: storedImageUrl,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message:
            error instanceof Error ? error.message : "A server error occurred.",
        },
      } as IErrorResponse,
      { status: 500 }
    );
  }
}
