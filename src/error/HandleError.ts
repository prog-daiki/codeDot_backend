import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

/**
 * エラーを処理し、適切なレスポンスを返す関数
 * @param {Context} context - Honoのコンテキスト
 * @param {unknown} error - 発生したエラー
 * @param {string} logMessage - ログに記録するメッセージ
 * @returns {Response} JSONレスポンス
 */
export const HandleError = (c: Context, error: unknown, message: string) => {
  console.error(`${message}:`, error);

  const statusCode: StatusCode = 500;
  const errorMessage: string = message;

  return c.json({ error: errorMessage }, statusCode);
};
