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
  // 기본 템플릿
  default: (concern: string) =>
    `A modern pastel illustration of a Japanese-style lucky charm (omamori) with a cute, chubby cat character, expressing encouragement related to: "${concern}". The charm includes Japanese aesthetic elements, decorative knots, and spiritual symbols. The talisman displays relevant encouraging words in English. Style: Kawaii, pastel colors, soft edges, warm and magical feeling. Aspect ratio 9:16.`,

  // 연애 관련 템플릿
  romance: (concern: string) =>
    `A beautifully designed Japanese love charm (omamori) with heart motifs and soft pink/red colors. Features a cute cat character and romantic symbols. The talisman includes an encouraging message about love: "${concern}". Style: Romantic, dreamy, kawaii, with soft pastel colors. Aspect ratio 9:16.`,

  // 직장/커리어 관련 템플릿
  career: (concern: string) =>
    `A professional-looking Japanese success charm (omamori) with elements symbolizing career growth and achievement. Features a determined-looking cat character in business attire. Includes an encouraging message about career: "${concern}". Style: Professional with playful elements, blue and gold color scheme. Aspect ratio 9:16.`,

  // 금전 관련 템플릿
  money: (concern: string) =>
    `A prosperity-focused Japanese wealth charm (omamori) with gold coins, money symbols and lucky elements. Features a happy cat character with a coin. Includes an encouraging message about finances: "${concern}". Style: Abundant, prosperous, with green and gold colors. Aspect ratio 9:16.`,

  // 심리 관련 템플릿
  psychology: (concern: string) =>
    `A calming Japanese healing charm (omamori) with elements symbolizing mental peace and balance. Features a meditating cat character with serene expression. Includes a comforting message about mental well-being: "${concern}". Style: Serene, soothing, with purples and blues. Aspect ratio 9:16.`,

  // 인간관계 관련 템플릿
  relationships: (concern: string) =>
    `A harmonious Japanese friendship charm (omamori) with elements symbolizing connection and social bonds. Features multiple cute cat characters together. Includes an encouraging message about relationships: "${concern}". Style: Warm, connected, with yellows and oranges. Aspect ratio 9:16.`,

  // 라이프스타일 관련 템플릿
  lifestyle: (concern: string) =>
    `A balanced Japanese lifestyle charm (omamori) with elements symbolizing harmony and life enjoyment. Features a content cat character engaged in various activities. Includes an encouraging message about life balance: "${concern}". Style: Harmonious, diverse, with balanced color palette. Aspect ratio 9:16.`,
};

// 응원 메시지 (영어)
const encouragingPhrases = {
  romance: [
    "Love will find its way",
    "Your heart knows the answer",
    "Romantic joy awaits you",
    "Trust in love's timing",
    "Your heart deserves happiness",
  ],
  career: [
    "Success is your journey",
    "Your talents will shine",
    "Each challenge builds strength",
    "Your work matters",
    "Progress, not perfection",
  ],
  money: [
    "Prosperity flows to you",
    "Financial wisdom guides you",
    "Abundance is your birthright",
    "Money serves your dreams",
    "You create lasting wealth",
  ],
  psychology: [
    "Inner peace is your strength",
    "Your mind grows stronger each day",
    "Healing happens in its time",
    "You are enough, just as you are",
    "Each step forward matters",
  ],
  relationships: [
    "Connections bring joy",
    "You're worthy of understanding",
    "Healthy boundaries bring peace",
    "True friends see your light",
    "Your voice deserves to be heard",
  ],
  lifestyle: [
    "Balance creates harmony",
    "Your choices shape your joy",
    "Small changes, big impact",
    "Your path is uniquely yours",
    "Today's choices shape tomorrow",
  ],
};

// 상세 고민 매핑 (한글->영어)
const concernDetailsKoToEn = {
  // 심리
  자기계발: "Self-improvement",
  "인생의 의미": "Life Purpose",
  "내가 가는 길이 맞을까": "Am I on the Right Path?",
  "꿈이 없는 것 같아": "Feeling Like I Have No Dreams",
  "목표 없는 불안감": "Anxiety Without Goals",
  "내가 뭘 원하는지 모르겠어": "Not Knowing What I Want",
  불안: "Anxiety",
  우울: "Depression",
  자존감: "Self-esteem",

  // 연애
  짝사랑: "Crush",
  고백: "When to Confess",
  "친구에서 연인으로": "Friends to Lovers?",
  밀당: "Playing Hard to Get",
  "상대방 마음": "How They Feel About Me",
  "초반 연애": "Early Dating",
  "발전 가능성": "Will This Develop into a Real Relationship?",
  "연락 빈도": "Optimal Contact Frequency",

  // 직장/커리어
  퇴사: "Resignation Thoughts",
  이직: "Job Change Preparation",
  "직장 내 인간관계": "Workplace Relationships",
  번아웃: "Burnout",
  연봉협상: "Salary Negotiation",

  // 금전
  "월급 관리": "Salary Management",
  저축: "Savings",
  부업: "Side Jobs",
  "투자 실패": "Investment Failures",
  빚: "Debt Concerns",

  // 인간관계
  "가족 갈등": "Family Conflicts",
  "친구 문제": "Friend Issues",
  "의사소통 문제": "Communication Problems",
  "모임 스트레스": "Social Gathering Stress",
  "SNS 피로감": "Social Media Fatigue",

  // 라이프스타일
  워라밸: "Work-life Balance",
  "취미 찾기": "Finding Hobbies",
  "미래 걱정": "Future Concerns",
  "독립 생활": "Independent Living",
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
function getTemplateByCategory(category: string, concern: string): string {
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

  // 영어로 카테고리 변환 (한글인 경우)
  const categoryMapping = {
    연애: "Romance",
    직장: "Career",
    커리어: "Career",
    금전: "Money",
    돈: "Money",
    심리: "Psychology",
    인간관계: "Relationships",
    라이프스타일: "Lifestyle",
    생활: "Lifestyle",
  };

  // 한글 카테고리 및 세부 고민을 영어로 변환
  let translatedConcern = concern;

  // 카테고리 변환
  Object.entries(categoryMapping).forEach(([korean, english]) => {
    const regex = new RegExp(korean, "g");
    translatedConcern = translatedConcern.replace(regex, english);
  });

  // 세부 고민 변환
  Object.entries(concernDetailsKoToEn).forEach(([korean, english]) => {
    if (translatedConcern.includes(korean)) {
      // 한글 세부 고민을 영어로 변환 (정확한 매칭을 위해 전체 문자열 체크)
      const regex = new RegExp(korean, "g");
      translatedConcern = translatedConcern.replace(regex, english);
    }
  });

  // 응원 메시지 생성
  const encouragingPhrase = getRandomPhrase(mappedCategory);
  console.log("응원 메시지:", encouragingPhrase);

  // 상세 고민과 응원 메시지 조합
  const combinedMessage = `${translatedConcern}. ${encouragingPhrase}!`;

  // 템플릿 함수 가져오기
  const templateFn =
    talismanTemplates[mappedCategory as keyof typeof talismanTemplates] ||
    talismanTemplates.default;

  // 템플릿 적용
  return templateFn(combinedMessage);
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
    const prompt = getTemplateByCategory(mainCategory, concern);
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
