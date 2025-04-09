import { NextResponse } from "next/server";
import Replicate from "replicate";
import { IErrorResponse } from "@/app/type/types";
import { saveTalismanImage } from "@/app/lib/storage";

// Replicate 클라이언트 초기화
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const talismanTemplates = {
  default: (phrase: string) =>
    `A vintage-style tarot card illustration featuring an anthropomorphic white cat in a mystical pose. The cat wears ornate medieval clothing and stands at the center of a symbolic magical scene. The overall emotion and symbolism of the card reflect a message of: ${phrase}. Style: Classic tarot, painterly details, fantasy European atmosphere. No written text or characters in the image. Aspect ratio 9:16.`,

  romance: (phrase: string) =>
    `A romantic tarot card illustration featuring a cat in flowing robes, holding a rose under a glowing sky. Surrounded by hearts, flowers, and stars, the visual mood represents: ${phrase}. Style: Vintage tarot, dreamy and warm tones. No text or visible letters in the image. Aspect ratio 9:16.`,

  career: (phrase: string) =>
    `A tarot card showing a regal cat emperor seated on a throne with scrolls and a scepter. The image radiates the feeling of: ${phrase}. Style: Classic European tarot, rich symbolic composition, ornate throne and medieval symbols. No text or writing in the image. Aspect ratio 9:16.`,

  money: (phrase: string) =>
    `A tarot card illustration of a noble cat surrounded by coins, golden treasure, and light beams. The illustration visually conveys abundance and the mood of: ${phrase}. Style: Medieval tarot painting, luxurious and radiant. No written text or typographic elements. Aspect ratio 9:16.`,

  psychology: (phrase: string) =>
    `A peaceful tarot card illustration with a meditating cat by a calm river under a starry sky. Flowers, stars, and water symbolize healing and inner balance, evoking the emotion of: ${phrase}. Style: Soft tarot painting, tranquil and spiritual. No text in the image. Aspect ratio 9:16.`,

  relationships: (phrase: string) =>
    `A tarot card with two joyful cats gently interacting under a sunny sky, surrounded by doves and vines. The connection between the characters symbolizes: ${phrase}. Style: Vintage love tarot, harmonious and warm. No text or writing in the image. Aspect ratio 9:16.`,

  lifestyle: (phrase: string) =>
    `A tarot card showing a cheerful cat dancing, eating, or reading in a relaxed environment. Books, food, and plants around the cat represent the feeling of: ${phrase}. Style: Wholesome classic tarot, bright and delightful. No visible text in the image. Aspect ratio 9:16.`,
};

// const encouragingPhrases: Record<string, string[]> = {
//   romance: [
//     "Love is blooming for you 🌸",
//     "Trust your heart 💖",
//     "Romance is in the air 💌",
//     "Your love story unfolds 💕",
//     "Someone special is thinking of you ✨",
//   ],
//   career: [
//     "Your growth is unstoppable 💼",
//     "New opportunities await 🚀",
//     "Your talents shine bright 🌟",
//     "Step forward with confidence 💪",
//     "Success is calling 📈",
//   ],
//   money: [
//     "Abundance flows to you 💰",
//     "Your wealth is growing 🍀",
//     "Every coin counts ✨",
//     "Smart moves bring fortune 🧠",
//     "You attract prosperity 🌈",
//   ],
//   psychology: [
//     "Peace begins with you 🧘‍♀️",
//     "You are enough 🌿",
//     "Let your mind rest ☁️",
//     "Breathe. You're doing well 🍃",
//     "Healing is happening 🌸",
//   ],
//   relationships: [
//     "You're surrounded by love 💞",
//     "True friends see your light 🌟",
//     "Your connections are precious 🤝",
//     "Kindness comes back to you 💫",
//     "Warmth is all around you 🧣",
//   ],
//   lifestyle: [
//     "Live your rhythm 🎵",
//     "Balance brings joy ⚖️",
//     "Little joys matter 🧸",
//     "Slow down and smile 😊",
//     "Your path is beautiful 🌈",
//   ],
//   default: [
//     "Magic is all around ✨",
//     "Believe in your story 📖",
//     "Today holds surprises 🌟",
//     "You've got this 💫",
//     "Shine your light 🌞",
//   ],
// };

const encouragingPhrases: Record<string, string[]> = {
  romance: [
    "사랑이 피어나는 중이에요 🌸",
    "당신의 마음을 믿어보세요 💖",
    "연애의 기운이 감돌아요 💌",
    "당신의 러브스토리가 펼쳐져요 💕",
    "누군가 당신을 생각하고 있어요 ✨",
  ],
  career: [
    "당신의 성장은 멈추지 않아요 💼",
    "새로운 기회가 기다리고 있어요 🚀",
    "당신의 재능이 빛나고 있어요 🌟",
    "자신감을 가지고 나아가세요 💪",
    "성공이 당신을 부르고 있어요 📈",
  ],
  money: [
    "풍요가 당신에게 흘러들고 있어요 💰",
    "당신의 재산이 자라고 있어요 🍀",
    "작은 돈도 소중해요 ✨",
    "현명한 선택이 행운을 가져다줘요 🧠",
    "당신은 부를 끌어들이고 있어요 🌈",
  ],
  psychology: [
    "마음의 평화는 당신 안에서 시작돼요 🧘‍♀️",
    "당신은 이미 충분해요 🌿",
    "생각을 잠시 쉬게 해도 괜찮아요 ☁️",
    "숨을 쉬세요. 잘하고 있어요 🍃",
    "회복은 지금도 이루어지고 있어요 🌸",
  ],
  relationships: [
    "당신은 사랑으로 둘러싸여 있어요 💞",
    "진정한 친구는 당신의 빛을 알아봐요 🌟",
    "소중한 인연들이 함께해요 🤝",
    "친절은 반드시 돌아와요 💫",
    "따뜻함이 곁에 있어요 🧣",
  ],
  lifestyle: [
    "당신만의 리듬으로 살아가세요 🎵",
    "균형은 행복의 열쇠예요 ⚖️",
    "작은 기쁨이 큰 행복이에요 🧸",
    "잠시 멈추고 미소 지어보세요 😊",
    "당신의 길은 아름다워요 🌈",
  ],
  default: [
    "세상은 마법으로 가득해요 ✨",
    "당신의 이야기를 믿으세요 📖",
    "오늘은 놀라움이 가득할 거예요 🌟",
    "당신은 무엇이든 해낼 수 있어요 💫",
    "당신의 빛을 세상에 보여주세요 🌞",
  ],
};

function getTemplateByCategory(category: string): {
  prompt: string;
  phrase: string;
} {
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
  console.log("mappedCategory", mappedCategory);
  const phrase = getRandomPhrase(mappedCategory);
  console.log("phrase", phrase);
  const templateFn =
    talismanTemplates[mappedCategory as keyof typeof talismanTemplates] ||
    talismanTemplates.default;

  return {
    prompt: templateFn(phrase),
    phrase,
  };
}

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
    const { prompt, phrase } = getTemplateByCategory(mainCategory);
    console.log("이미지 생성 프롬프트:", prompt);

    // Replicate API 호출 시 추가 매개변수 설정
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-dev",
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
    const maxRetries = 60; // 최대 60초 대기로 증가

    console.log(
      "이미지 생성 상태 폴링 시작, 최대 대기 시간:",
      maxRetries,
      "초"
    );

    while (
      finalPrediction.status !== "succeeded" &&
      finalPrediction.status !== "failed" &&
      retryCount < maxRetries
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        finalPrediction = await replicate.predictions.get(prediction.id);
        console.log(
          `폴링 ${retryCount + 1}/${maxRetries}: 상태=${finalPrediction.status}`
        );
      } catch (pollError) {
        console.error(
          `폴링 오류 (${retryCount + 1}/${maxRetries}):`,
          pollError
        );
      }
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
                ? "이미지 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
                : "이미지 생성에 실패했습니다.",
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
      translatedPhrase: phrase,
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
      storedImageUrl: storedImageUrl?.url || replicateImageUrl,
      translatedPhrase: phrase,
      id: storedImageUrl?.talisman?.id,
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
