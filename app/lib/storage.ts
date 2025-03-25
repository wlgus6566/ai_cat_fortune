import { v4 as uuidv4 } from "uuid";
import supabaseAdmin from "./supabase-admin";
import { db } from "@/db";
import { talismansTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// 버킷 이름 상수
const TALISMAN_BUCKET = "talismans";

/**
 * Supabase Storage 버킷 초기화
 */
export async function initializeTalismanStorage() {
  try {
    // 기존 버킷 확인
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === TALISMAN_BUCKET
    );

    // 버킷이 없으면 생성
    if (!bucketExists) {
      const { error } = await supabaseAdmin.storage.createBucket(
        TALISMAN_BUCKET,
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB 제한
        }
      );

      if (error) throw error;
      console.log(`'${TALISMAN_BUCKET}' 버킷 생성 완료`);
    }
  } catch (error) {
    console.error("버킷 초기화 오류:", error);
    throw error;
  }
}

/**
 * URL에서 이미지 다운로드
 */
async function downloadImageFromUrl(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `이미지 다운로드 실패: ${response.status} ${response.statusText}`
    );
  }
  return await response.arrayBuffer();
}

/**
 * 부적 이미지를 Supabase Storage에 저장하고 DB에 기록
 */
export async function saveTalismanImage(
  imageUrl: string,
  userId?: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    console.log("부적 이미지 저장 시작:", { userId, metadata });

    // 버킷 초기화 확인
    await initializeTalismanStorage();

    // 이미지 다운로드
    const imageBuffer = await downloadImageFromUrl(imageUrl);
    console.log("이미지 다운로드 완료:", imageBuffer.byteLength, "바이트");

    // 파일 이름 생성
    const fileId = uuidv4();
    const fileName = `${userId}/${fileId}.jpg`;

    console.log("Supabase Storage에 업로드 시작:", fileName);
    // 이미지 저장
    const { error } = await supabaseAdmin.storage
      .from(TALISMAN_BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
        ...(metadata && { metadata }),
      });

    if (error) {
      console.error("Storage 업로드 오류:", error);
      throw error;
    }

    console.log("이미지 업로드 성공");

    // 공개 URL 생성
    const { data: publicUrl } = supabaseAdmin.storage
      .from(TALISMAN_BUCKET)
      .getPublicUrl(fileName);

    console.log("공개 URL 생성:", publicUrl.publicUrl);

    // Drizzle ORM을 사용하여 데이터베이스에 저장
    try {
      console.log("Drizzle ORM으로 데이터베이스 저장 시도");
      const newTalisman = await db
        .insert(talismansTable)
        .values({
          userId: userId,
          storagePath: fileName,
          fileName: `talisman-${new Date().toISOString()}.jpg`,
          fileSize: imageBuffer.byteLength.toString(),
          fileType: "image/jpeg",
          concern: metadata?.concern || "",
          generatedBy: "AI",
        })
        .returning();

      console.log("DB 저장 성공:", newTalisman);
    } catch (dbError) {
      console.error("Drizzle ORM 데이터베이스 저장 오류:", dbError);
      // 저장에 실패해도 URL은 반환
    }

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("부적 이미지 저장 오류:", error);
    throw error;
  }
}

/**
 * 사용자의 부적 이미지 목록 조회
 */
export async function getUserTalismans(userId: string): Promise<string[]> {
  try {
    // Drizzle ORM을 사용하여 데이터베이스에서 사용자의 부적 목록 조회
    const talismans = await db.query.talismansTable.findMany({
      where: eq(talismansTable.userId, userId),
      orderBy: [desc(talismansTable.createdAt)],
    });

    // 공개 URL 목록 반환
    return talismans.map((talisman) => {
      const { data: publicUrl } = supabaseAdmin.storage
        .from(TALISMAN_BUCKET)
        .getPublicUrl(talisman.storagePath);

      return publicUrl.publicUrl;
    });
  } catch (error) {
    console.error("사용자 부적 이미지 조회 오류:", error);

    // 에러 발생 시 스토리지 직접 조회 시도 (대체 메서드)
    try {
      const { data, error: storageError } = await supabaseAdmin.storage
        .from(TALISMAN_BUCKET)
        .list(userId);

      if (storageError) throw storageError;

      // 공개 URL 목록 반환
      return data.map((item) => {
        const { data: publicUrl } = supabaseAdmin.storage
          .from(TALISMAN_BUCKET)
          .getPublicUrl(`${userId}/${item.name}`);

        return publicUrl.publicUrl;
      });
    } catch (fallbackError) {
      console.error("대체 부적 이미지 조회 오류:", fallbackError);
      return [];
    }
  }
}
