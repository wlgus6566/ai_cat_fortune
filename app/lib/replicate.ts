import Replicate from 'replicate';

// Replicate 클라이언트 초기화
// 주의: Replicate API를 사용하려면 계정에 결제 정보가 등록되어 있어야 합니다.
// https://replicate.com/account/billing 에서 결제 정보를 설정하세요.
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 오류 인터페이스 정의
interface ReplicateError {
  message?: string;
  status?: number;
  detail?: string;
  title?: string;
}

/**
 * 텍스트 프롬프트를 기반으로 이미지를 생성하는 함수
 * 참고: Replicate API 사용 시 결제 정보가 필요합니다.
 */
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log('Replicate API 호출 시도:', prompt);
    
    // Stable Diffusion 모델 실행
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        },
      }
    );

    console.log('Replicate API 응답:', JSON.stringify(output));
    
    // Replicate는 배열의 첫 번째 항목으로 이미지 URL을 반환합니다
    return Array.isArray(output) && output.length > 0 
      ? output[0] 
      : null;
  } catch (error: unknown) {
    // 402 Payment Required 오류 체크
    const replicateError = error as ReplicateError;
    console.error('Replicate API 오류 상세 정보:', JSON.stringify(replicateError));
    
    if (replicateError.message && replicateError.message.includes('402')) {
      console.error('Replicate API 결제 정보 오류:', 
        '이 기능을 사용하려면 Replicate 계정에 결제 정보를 등록해야 합니다. ',
        'https://replicate.com/account/billing 에서 결제 정보를 설정하세요.');
    } else {
      console.error('이미지 생성 중 오류:', error);
    }
    return null;
  }
}

/**
 * 고민에 맞는 부적 이미지를 생성하는 함수
 * 참고: Replicate API 사용 시 결제 정보가 필요합니다.
 */
export async function generateTalismanImage(concern: string): Promise<string | null> {
  console.log('부적 이미지 생성 요청:', concern);
  
  // 부적 이미지를 생성하기 위한 프롬프트
  const talismanPrompt = `A Korean traditional talisman for ${concern}, magical protection charm, mystical symbols, spiritual power, Korean shamanism style, vibrant red and black ink, detailed calligraphy, no text, powerful fortune protection`;
  
  const result = await generateImage(talismanPrompt);
  console.log('부적 이미지 생성 결과:', result);
  return result;
} 