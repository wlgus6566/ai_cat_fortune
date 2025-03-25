# Supabase 및 Drizzle ORM 설정 가이드

이 문서는 AI 포춘 앱을 위한 Supabase와 Drizzle ORM 설정 가이드입니다. Supabase를 데이터베이스와 스토리지로 사용하며, Drizzle ORM을 통해 데이터를 관리합니다.

## 데이터 스키마 (db/schema.ts)

### 1. 사용자 프로필 테이블 (user_profiles)

사용자 프로필은 session ID를 기본 키로 사용하며, 설정 페이지에서 입력한 사용자 정보를 저장합니다:

```typescript
// db/schema.ts
export const userProfilesTable = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gender: text("gender"),
  birthDate: text("birth_date"),
  calendarType: text("calendar_type"),
  birthTime: text("birth_time"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// 타입 내보내기
export type InsertUserProfile = typeof userProfilesTable.$inferInsert;
export type SelectUserProfile = typeof userProfilesTable.$inferSelect;
```

### 2. 부적 테이블 (talismans)

부적 이미지는 Supabase Storage에 저장되고, 메타데이터는 talismans 테이블에 저장됩니다:

```typescript
// db/schema.ts
export const talismansTable = pgTable("talismans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfilesTable.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size"),
  fileType: text("file_type"),
  concern: text("concern"),
  concernType: text("concern_type"),
  generatedBy: text("generated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 타입 내보내기
export type InsertTalisman = typeof talismansTable.$inferInsert;
export type SelectTalisman = typeof talismansTable.$inferSelect;
```

## 설정 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 연결 정보를 설정합니다:

```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_ID].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### 2. Drizzle ORM 마이그레이션

1. **마이그레이션 파일 생성**: 다음 명령을 실행하여 마이그레이션 파일을 생성합니다:

```bash
npx drizzle-kit generate:pg
```

이 명령어는 `drizzle.config.ts` 설정에 따라 `supabase/migrations` 폴더에 SQL 파일을 생성합니다.

2. **마이그레이션 적용**: 다음 코드를 실행하여 마이그레이션을 적용합니다:

```typescript
import { runMigrations } from "@/db/migrations";

try {
  await runMigrations();
  console.log("마이그레이션 성공");
} catch (error) {
  console.error("마이그레이션 실패:", error);
}
```

또는 터미널에서 다음 명령을 실행할 수 있습니다:

```bash
node -r ts-node/register db/migrations.ts
```

### 3. Supabase Storage 설정

Supabase 스토리지 버킷을 설정하기 위해 관리자 페이지(`/admin/db-setup`)를 방문하거나, Supabase 대시보드에서 직접 설정할 수 있습니다:

1. [Supabase 대시보드](https://app.supabase.io/)에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 "스토리지"를 클릭합니다.
4. "새 버킷" 버튼을 클릭합니다.
5. 다음 설정으로 버킷을 생성합니다:
   - 이름: `talismans`
   - 공개 접근: `활성화`
   - 파일 크기 제한: `10MB`
   - 허용된 MIME 타입: `image/png, image/jpeg, image/gif, image/webp`

## API 유틸리티 함수

새로 추가된 API 유틸리티 함수를 사용하여 부적을 관리할 수 있습니다:

### 부적 저장

```typescript
import { saveTalisman } from "@/app/lib/talismanUtils";

// base64 이미지 저장
await saveTalisman(
  userId, // 사용자 ID
  base64Image, // base64 인코딩된 이미지
  "건강 문제 해결" // 고민 내용
);

// 파일 업로드
await saveTalisman(
  userId, // 사용자 ID
  fileObject, // File 객체
  "취업 성공", // 고민 내용
  "진로/취업" // 고민 유형 (선택 사항)
);
```

### 사용자의 부적 목록 조회

```typescript
import { getTalismansByUserId } from "@/app/lib/talismanUtils";

const talismans = await getTalismansByUserId(userId);
// 결과: [{id, userId, storagePath, fileName, concern, publicUrl, ...}, ...]
```

### 부적 삭제

```typescript
import { deleteTalisman } from "@/app/lib/talismanUtils";

await deleteTalisman(talismanId, userId);
```

## API 엔드포인트

부적 관리를 위한 RESTful API 엔드포인트가 구현되어 있습니다:

- `POST /api/talisman`: 새 부적 생성
- `GET /api/talisman`: 현재 사용자의 모든 부적 조회
- `GET /api/talisman/user?userId=xxx`: 특정 사용자의 부적 조회
- `DELETE /api/talisman?id=xxx`: 특정 부적 삭제

## Drizzle ORM을 직접 사용하기

모델을 직접 쿼리하려면 다음과 같이 Drizzle ORM을 사용할 수 있습니다:

```typescript
import { db } from "@/db";
import { userProfilesTable, talismansTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// 단일 사용자 조회
const user = await db.query.userProfilesTable.findFirst({
  where: eq(userProfilesTable.id, userId),
});

// 모든 사용자 조회
const allUsers = await db.query.userProfilesTable.findMany();

// 데이터 삽입
const newUser = await db
  .insert(userProfilesTable)
  .values({
    id: "user123",
    name: "홍길동",
    gender: "남성",
    birthDate: "1990-01-01",
  })
  .returning();

// 데이터 업데이트
await db
  .update(userProfilesTable)
  .set({ name: "김철수" })
  .where(eq(userProfilesTable.id, "user123"));

// 데이터 삭제
await db.delete(userProfilesTable).where(eq(userProfilesTable.id, "user123"));
```
