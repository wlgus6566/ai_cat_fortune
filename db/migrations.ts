import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

/**
 * 마이그레이션 실행 함수
 * drizzle-kit generate 명령으로 생성된 마이그레이션 파일을 적용합니다.
 */
export const runMigrations = async () => {
  try {
    console.log("마이그레이션 시작...");

    // supabase/migrations 디렉토리의 마이그레이션 파일 적용
    await migrate(db, { migrationsFolder: "./supabase/migrations" });

    console.log("마이그레이션 완료!");
    return {
      success: true,
      message: "마이그레이션이 성공적으로 완료되었습니다.",
    };
  } catch (error) {
    console.error("마이그레이션 오류:", error);
    return {
      success: false,
      message: `마이그레이션 오류: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * 마이그레이션 생성 및 적용 순서
 *
 * 1. 스키마 정의: db/schema.ts에 테이블 스키마 정의
 * 2. 마이그레이션 파일 생성:
 *    - 명령어: npx drizzle-kit generate:pg
 *    - 위 명령어는 drizzle.config.ts 설정에 따라 supabase/migrations 폴더에 SQL 파일 생성
 * 3. 마이그레이션 적용:
 *    - 아래 예시 코드로 적용
 *
 * // 마이그레이션 적용 예시 코드
 * import { runMigrations } from '@/db/migrations';
 *
 * try {
 *   await runMigrations();
 *   console.log('마이그레이션 성공');
 * } catch (error) {
 *   console.error('마이그레이션 실패:', error);
 * }
 */

// 터미널에서 직접 실행할 경우 (node -r ts-node/register db/migrations.ts)
if (require.main === module) {
  runMigrations()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("마이그레이션 실행 중 예외 발생:", error);
      process.exit(1);
    });
}
