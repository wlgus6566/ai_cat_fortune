import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';

// 버킷 이름 상수
const TALISMAN_BUCKET = 'talismans';

/**
 * Supabase Storage 버킷 초기화
 */
export async function initializeTalismanStorage() {
  try {
    // 기존 버킷 확인
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === TALISMAN_BUCKET);
    
    // 버킷이 없으면 생성
    if (!bucketExists) {
      const { error } = await supabaseAdmin.storage.createBucket(TALISMAN_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB 제한
      });
      
      if (error) throw error;
      console.log(`'${TALISMAN_BUCKET}' 버킷 생성 완료`);
    }
  } catch (error) {
    console.error('버킷 초기화 오류:', error);
    throw error;
  }
}

/**
 * URL에서 이미지 다운로드
 */
async function downloadImageFromUrl(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`이미지 다운로드 실패: ${response.status} ${response.statusText}`);
  }
  return await response.arrayBuffer();
}

/**
 * 부적 이미지를 Supabase Storage에 저장
 */
export async function saveTalismanImage(
  imageUrl: string, 
  userId?: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    // 버킷 초기화 확인
    await initializeTalismanStorage();
    
    // 이미지 다운로드
    const imageBuffer = await downloadImageFromUrl(imageUrl);
    
    // 파일 이름 생성 (유저 ID가 있으면 추가)
    const fileName = userId
      ? `${userId}/${uuidv4()}.jpg`
      : `${uuidv4()}.jpg`;
    
    // 이미지 저장
    const { error } = await supabaseAdmin.storage
      .from(TALISMAN_BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
        ...(metadata && { metadata })
      });
    
    if (error) throw error;
    
    // 공개 URL 생성
    const { data: publicUrl } = supabaseAdmin.storage
      .from(TALISMAN_BUCKET)
      .getPublicUrl(fileName);
    
    return publicUrl.publicUrl;
  } catch (error) {
    console.error('부적 이미지 저장 오류:', error);
    throw error;
  }
}

/**
 * 사용자의 부적 이미지 목록 조회
 */
export async function getUserTalismans(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(TALISMAN_BUCKET)
      .list(userId);
    
    if (error) throw error;
    
    // 공개 URL 목록 반환
    return data.map(item => {
      const { data: publicUrl } = supabaseAdmin.storage
        .from(TALISMAN_BUCKET)
        .getPublicUrl(`${userId}/${item.name}`);
      
      return publicUrl.publicUrl;
    });
  } catch (error) {
    console.error('사용자 부적 이미지 조회 오류:', error);
    return [];
  }
} 