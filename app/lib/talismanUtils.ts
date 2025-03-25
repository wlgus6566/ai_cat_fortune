import { v4 as uuidv4 } from "uuid";
import { createSupabaseClient } from "./supabase";
import { db } from "@/db";
import { talismansTable, userProfilesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// 파일 확장자 추출 유틸리티
const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// base64 이미지를 File 객체로 변환
const base64ToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

/**
 * 부적 이미지를 Supabase Storage에 저장하고 메타데이터를 DB에 저장
 *
 * @param userId 사용자 ID
 * @param imageData base64 인코딩된 이미지 또는 File 객체
 * @param concern 부적 생성시 입력한 고민 내용
 * @param concernType 고민 유형 (선택 사항)
 * @param fileName 원본 파일명 (제공되지 않은 경우 자동 생성)
 * @returns 저장된 부적 정보
 */
export const saveTalisman = async (
  userId: string,
  imageData: string | File,
  concern: string,
  concernType?: string,
  fileName?: string
) => {
  try {
    const supabase = createSupabaseClient();

    // 사용자 존재 여부 확인
    const userProfile = await db.query.userProfilesTable.findFirst({
      where: eq(userProfilesTable.id, userId),
    });

    if (!userProfile) {
      throw new Error(`사용자 ID ${userId}를 찾을 수 없습니다.`);
    }

    // 이미지 데이터 준비
    let file: File;
    let originalFileName: string;

    if (typeof imageData === "string") {
      // base64 이미지인 경우
      originalFileName = fileName || `talisman-${Date.now()}.png`;
      file = base64ToFile(imageData, originalFileName);
    } else {
      // File 객체인 경우
      file = imageData;
      originalFileName = fileName || file.name;
    }

    // 파일 확장자 확인
    const fileExt = getFileExtension(originalFileName);
    const fileId = uuidv4();
    const storagePath = `${userId}/${fileId}.${fileExt}`;

    // Supabase Storage에 파일 업로드
    const { error: storageError } = await supabase.storage
      .from("talismans")
      .upload(storagePath, file);

    if (storageError) {
      console.error("부적 이미지 업로드 실패:", storageError);
      throw new Error(`부적 이미지 업로드 실패: ${storageError.message}`);
    }

    // DB에 메타데이터 저장
    const newTalisman = await db
      .insert(talismansTable)
      .values({
        id: fileId,
        userId: userId,
        storagePath: storagePath,
        fileName: originalFileName,
        fileSize: file.size.toString(),
        fileType: file.type,
        concern: concern,
        concernType: concernType || null,
        generatedBy: "AI",
      })
      .returning();

    // 파일 저장 실패시 업로드된 이미지 삭제
    if (!newTalisman || newTalisman.length === 0) {
      await supabase.storage.from("talismans").remove([storagePath]);
      throw new Error("부적 메타데이터 저장 실패");
    }

    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from("talismans")
      .getPublicUrl(storagePath);

    return {
      ...newTalisman[0],
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("부적 저장 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 사용자의 부적 목록 조회
 *
 * @param userId 사용자 ID
 * @returns 부적 목록
 */
export const getTalismansByUserId = async (userId: string) => {
  try {
    const supabase = createSupabaseClient();

    // DB에서 부적 목록 조회
    const talismans = await db.query.talismansTable.findMany({
      where: eq(talismansTable.userId, userId),
      orderBy: (talismans, { desc }) => [desc(talismans.createdAt)],
    });

    // 각 부적에 공개 URL 추가
    const talismansWithUrls = talismans.map((talisman) => {
      const { data: publicUrlData } = supabase.storage
        .from("talismans")
        .getPublicUrl(talisman.storagePath);

      return {
        ...talisman,
        publicUrl: publicUrlData.publicUrl,
      };
    });

    return talismansWithUrls;
  } catch (error) {
    console.error("부적 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 부적 삭제
 *
 * @param talismanId 삭제할 부적 ID
 * @param userId 요청한 사용자 ID (소유자 확인용)
 * @returns 삭제 결과
 */
export const deleteTalisman = async (talismanId: string, userId: string) => {
  try {
    const supabase = createSupabaseClient();

    // 부적 정보 조회
    const talisman = await db.query.talismansTable.findFirst({
      where: eq(talismansTable.id, talismanId),
    });

    if (!talisman) {
      throw new Error(`부적 ID ${talismanId}를 찾을 수 없습니다.`);
    }

    // 소유자 확인
    if (talisman.userId !== userId) {
      throw new Error("이 부적을 삭제할 권한이 없습니다.");
    }

    // DB에서 메타데이터 삭제
    await db.delete(talismansTable).where(eq(talismansTable.id, talismanId));

    // Storage에서 이미지 삭제
    const { error: storageError } = await supabase.storage
      .from("talismans")
      .remove([talisman.storagePath]);

    if (storageError) {
      console.error("부적 이미지 삭제 실패:", storageError);
      // 이미지 삭제 실패는 오류로 전파하지 않음 (DB 데이터는 이미 삭제됨)
    }

    return { success: true, message: "부적이 성공적으로 삭제되었습니다." };
  } catch (error) {
    console.error("부적 삭제 중 오류 발생:", error);
    throw error;
  }
};
