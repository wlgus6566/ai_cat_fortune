import { pgTable, serial, text, timestamp, jsonb, varchar, integer, foreignKey, uuid, boolean } from 'drizzle-orm/pg-core';

// 사용자 테이블
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), // UUID를 기본 키로 사용
  name: text('name').notNull(),
  email: text('email').unique(), // 이메일은 고유해야 함
  gender: text('gender').notNull(), // '남성' 또는 '여성'
  birthDate: text('birth_date').notNull(), // 'YYYY-MM-DD' 형식
  calendarType: text('calendar_type').notNull(), // '양력' 또는 '음력'
  birthTime: text('birth_time').notNull(), // 태어난 시간 (자시, 축시 등)
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 부적 이미지 테이블
export const talismans = pgTable('talismans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // 사용자 참조
  imageUrl: text('image_url').notNull(), // Supabase Storage의 이미지 URL
  storageKey: text('storage_key').notNull(), // Supabase Storage의 저장 경로
  concern: text('concern').notNull(), // 부적 생성 시 고민 내용
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 운세 저장 테이블
export const fortunes = pgTable('fortunes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // 'YYYY-MM-DD' 형식
  content: jsonb('content').notNull(), // 전체 운세 데이터 (JSON)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 상담 히스토리 테이블
export const chatHistories = pgTable('chat_histories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  messages: jsonb('messages').notNull(), // 채팅 메시지 배열 (JSON)
  concernType: text('concern_type'), // 상담 고민 유형
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 유형별 선호도 저장 테이블 (사용자별 자주 사용하는 고민 유형 분석용)
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  concernType: text('concern_type').notNull(), // 고민 유형
  count: integer('count').notNull().default(1), // 사용 횟수
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 부적 공유 테이블 (향후 기능 확장 고려)
export const sharedTalismans = pgTable('shared_talismans', {
  id: uuid('id').primaryKey().defaultRandom(),
  talismanId: uuid('talisman_id').notNull().references(() => talismans.id, { onDelete: 'cascade' }),
  shareCode: text('share_code').unique().notNull(), // 공유 코드
  isActive: boolean('is_active').default(true).notNull(), // 공유 활성화 여부
  expiresAt: timestamp('expires_at'), // 공유 만료 시간 (null이면 무기한)
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 