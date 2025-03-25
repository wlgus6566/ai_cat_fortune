import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DB 연결 문자열
const connectionString = process.env.DATABASE_URL!;

// PostgreSQL 클라이언트
const client = postgres(connectionString);

// Drizzle ORM 인스턴스 생성
export const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
  schema,
});
