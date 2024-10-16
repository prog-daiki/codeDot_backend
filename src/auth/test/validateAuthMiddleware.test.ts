import type { Context } from "hono";
import { Messages } from "../../common/message";
import { describe, it, expect, beforeEach } from "bun:test";
import { validateAuthMiddleware } from "../validateAuthMiddelware";

describe("validateAuthMiddleware関数のテスト", () => {
  let context: Context;
  let nextCalled: boolean;

  beforeEach(() => {
    nextCalled = false;
    context = {
      json: (body: any, status: number) => {
        (context as any).responseBody = body;
        (context as any).status = status;
      },
      set: (key: string, value: string) => {
        if (!(context as any).headers) {
          (context as any).headers = {};
        }
        (context as any).headers[key] = value;
      },
      get: (key: string) => {
        if (key === "clerkAuth") {
          return { userId: (context as any).headers?.["userId"] || null };
        }
        return null;
      },
      headers: {},
    } as unknown as Context;
  });

  const next = async () => {
    nextCalled = true;
  };

  it("未認証ユーザーの場合、401エラーを返す", async () => {
    // userId を設定しないことで未認証状態をシミュレート
    await validateAuthMiddleware(context, next);

    expect((context as any).responseBody).toEqual({ error: Messages.MSG_ERR_001 });
    expect((context as any).status).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it("認証済みユーザーの場合、次のミドルウェアを呼び出し、userIdをセットする", async () => {
    // 認証済みユーザーのuserIdを設定
    (context as any).headers = { userId: "authenticated-user-id" };
    await validateAuthMiddleware(context, next);

    expect((context as any).headers["userId"]).toBe("authenticated-user-id");
    expect(nextCalled).toBe(true);
  });
});
