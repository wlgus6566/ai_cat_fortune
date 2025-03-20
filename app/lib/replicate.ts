import Replicate from 'replicate';

// 타입 정의
interface ReplicateConfig {
  modelVersion: string;
  imageParams: {
    width: number;
    height: number;
    num_inference_steps: number;
    guidance_scale: number;
    scheduler: string;
    num_outputs: number;
  };
}

// Replicate 설정
const REPLICATE_CONFIG: ReplicateConfig = {
  modelVersion: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  imageParams: {
    width: 768,
    height: 768,
    num_inference_steps: 25,
    guidance_scale: 7.5,
    scheduler: "K_EULER",
    num_outputs: 1
  }
};

// Replicate 클라이언트 초기화
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Replicate API 토큰 검증
 */
function validateApiToken() {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN이 설정되지 않았습니다.');
  }
}

/**
 * 이미지 생성 상태 폴링
 */
interface PredictionResponse {
  id: string;
  status: string;
  output?: string[] | null;
}

async function pollImageGeneration(prediction: PredictionResponse, maxRetries: number = 30): Promise<string> {
  let currentPrediction = prediction;
  let retryCount = 0;

  while (
    currentPrediction.status !== 'succeeded' &&
    currentPrediction.status !== 'failed' &&
    retryCount < maxRetries
  ) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentPrediction = await replicate.predictions.get(prediction.id);
    retryCount++;
  }

  if (retryCount >= maxRetries || currentPrediction.status === 'failed') {
    throw new Error(
      retryCount >= maxRetries
        ? '이미지 생성 시간이 초과되었습니다.'
        : '이미지 생성에 실패했습니다.'
    );
  }

  const output = currentPrediction.output;
  if (!output || !Array.isArray(output) || output.length === 0) {
    throw new Error('이미지 URL을 받지 못했습니다.');
  }

  return output[0];
}

/**
 * 에러 처리 및 변환
 */
function handleReplicateError(error: unknown): never {
  console.error('Replicate API 오류:', error);

  if (error instanceof Error) {
    // 결제 관련 오류
    if (error.message.includes('402') || error.message.includes('payment')) {
      throw new Error('결제 정보가 필요합니다. https://replicate.com/account/billing 에서 설정하세요.');
    }
    // 모델 버전 오류
    if (error.message.includes('422')) {
      throw new Error('이미지 생성 모델 버전이 올바르지 않습니다. 관리자에게 문의하세요.');
    }
    throw error;
  }
  
  throw new Error('알 수 없는 오류가 발생했습니다.');
}

/**
 * 텍스트 프롬프트를 기반으로 이미지를 생성하는 함수
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('Replicate API 호출 시도:', prompt);
    validateApiToken();

    const prediction = await replicate.predictions.create({
      version: REPLICATE_CONFIG.modelVersion,
      input: {
        prompt,
        negative_prompt: "text, watermark, signature, blurry, low quality, grainy, distorted",
        ...REPLICATE_CONFIG.imageParams
      }
    });

    console.log('Replicate API 응답:', JSON.stringify(prediction));
    return await pollImageGeneration(prediction);

  } catch (error) {
    handleReplicateError(error);
  }
}

/**
 * 부적 이미지 생성을 위한 프롬프트 생성
 */
function generateTalismanPrompt(concern: string, userName?: string): string {
  const userPrefix = userName ? `${userName}님을 위한 ` : '';
  return `Create a traditional Korean talisman (부적) for "${userPrefix}${concern}".
    Style: Authentic Korean shamanic art, traditional paper texture,
    Features: Mystical Korean symbols, powerful protection elements,
    Colors: Deep red and black ink, gold accents,
    Composition: Centered, balanced, flowing energy lines,
    Details: Intricate patterns, spiritual symbols, fortune elements,
    Mood: Sacred, powerful, protective,
    Quality: Ultra-detailed, sharp lines, clear artwork,
    Must Include: Korean fortune symbols, protection charms,
    Must Avoid: Modern elements, English text, computer-generated look`;
}

/**
 * 고민에 맞는 부적 이미지를 생성하는 함수
 */
export async function generateTalismanImage(concern: string, userName?: string): Promise<string> {
  console.log('부적 이미지 생성 요청:', { concern, userName });
  
  const prompt = generateTalismanPrompt(concern, userName);
  console.log('부적 이미지 생성 프롬프트:', prompt);
  
  try {
    const imageUrl = await generateImage(prompt);
    console.log('부적 이미지 생성 성공:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('부적 이미지 생성 실패:', error);
    throw error;
  }
} 