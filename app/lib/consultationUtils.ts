import { db } from "@/db";
import { consultationsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "../type/types";
import { createSupabaseClient } from "../lib/supabase";

const supabase = createSupabaseClient();

// 상담 내역 가져오기
export async function getConsultationsByUserId(userId: string) {
  try {
    const consultations = await db.query.consultationsTable.findMany({
      where: eq(consultationsTable.userId, userId),
      orderBy: [desc(consultationsTable.createdAt)],
      with: {
        talisman: true,
      },
    });

    // 부적 공개 URL 추가
    const consultationsWithUrl = await Promise.all(
      consultations.map(async (consultation) => {
        try {
          if (consultation.talisman && consultation.talisman.storagePath) {
            const { data } = supabase.storage
              .from("talismans")
              .getPublicUrl(consultation.talisman.storagePath);

            return {
              ...consultation,
              talisman: {
                ...consultation.talisman,
                publicUrl: data.publicUrl,
              },
            };
          }
          return consultation;
        } catch (error) {
          console.error("부적 URL 생성 오류:", error, consultation);
          // 오류가 발생해도 원본 consultation 반환
          return consultation;
        }
      })
    );

    return consultationsWithUrl;
  } catch (error) {
    console.error("상담 내역 조회 실패:", error);
    throw error;
  }
}

// 특정 상담 내역 가져오기
export async function getConsultationById(id: string) {
  try {
    const consultation = await db.query.consultationsTable.findFirst({
      where: eq(consultationsTable.id, id),
      with: {
        talisman: true,
      },
    });

    if (!consultation) {
      return null;
    }

    // 부적 공개 URL 추가
    try {
      if (consultation.talisman && consultation.talisman.storagePath) {
        const { data } = supabase.storage
          .from("talismans")
          .getPublicUrl(consultation.talisman.storagePath);

        return {
          ...consultation,
          talisman: {
            ...consultation.talisman,
            publicUrl: data.publicUrl,
          },
        };
      }
    } catch (error) {
      console.error("부적 URL 생성 오류:", error);
      // URL 생성에 실패해도 원본 consultation 반환
    }

    return consultation;
  } catch (error) {
    console.error("상담 내역 조회 실패:", error);
    throw error;
  }
}

// 상담 내역 저장
export async function saveConsultation(
  userId: string,
  title: string,
  messages: ChatMessage[],
  talismanId?: string
) {
  try {
    const newConsultation = {
      id: uuidv4(),
      userId,
      title,
      messages,
      ...(talismanId && { talismanId }),
    };

    const [consultation] = await db
      .insert(consultationsTable)
      .values(newConsultation)
      .returning();

    return consultation;
  } catch (error) {
    console.error("상담 내역 저장 실패:", error);
    throw error;
  }
}

// 상담 내역 삭제
export async function deleteConsultation(id: string, userId: string) {
  try {
    const [deletedConsultation] = await db
      .delete(consultationsTable)
      .where(
        eq(consultationsTable.id, id) && eq(consultationsTable.userId, userId)
      )
      .returning();

    return deletedConsultation;
  } catch (error) {
    console.error("상담 내역 삭제 실패:", error);
    throw error;
  }
}
