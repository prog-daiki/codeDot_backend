import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

/**
 * データベース接続に必要な環境変数のスキーマ
 */
const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

/**
 * データベース接続を初期化し、Drizzle ORM インスタンスを作成する
 * @returns Drizzle ORM インスタンス
 * @throws Error 環境変数が無効な場合
 */
export function initializeDatabase() {
  try {
    const env = DatabaseEnvSchema.parse(process.env);
    const queryClient = postgres(env.DATABASE_URL);
    return drizzle(queryClient);
  } catch (error) {
    console.error("データベース初期化エラー:", error);
    throw new Error("データベース接続の初期化に失敗しました");
  }
}

// データベース接続のインスタンスをエクスポート
export const db = initializeDatabase();
