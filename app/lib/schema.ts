import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// 사용자 테이블
export const userProfiles = pgTable("user_profiles", {
  // session_id를 기본키로 사용
  id: text("id").primaryKey(),
  // 사용자 기본 정보
  name: text("name").notNull(),
  gender: text("gender"), // '남성' 또는 '여성'
  birthDate: text("birth_date"), // 'YYYY-MM-DD' 형식
  calendarType: text("calendar_type"), // '양력' 또는 '음력'
  birthTime: text("birth_time"), // 태어난 시간 (자시, 축시 등)
  profileImageUrl: text("profile_image_url"),
  // 시스템 정보
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 부적 이미지 테이블
export const talismans = pgTable("talismans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }), // 사용자 참조
  // Supabase Storage 관련 정보
  storagePath: text("storage_path").notNull(), // 'user_id/uuid.png' 형식
  fileName: text("file_name").notNull(), // 원본 파일명
  fileSize: text("file_size"), // 파일 크기 (바이트)
  fileType: text("file_type"), // 파일 타입 (image/png, image/jpeg 등)
  // 부적 메타데이터
  concern: text("concern"), // 부적 생성 시 고민 내용
  concernType: text("concern_type"), // 고민 유형 (연애, 건강, 재정 등)
  generatedBy: text("generated_by").notNull(), // 생성 방식 (AI, 시스템 등)
  // 시스템 정보
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
