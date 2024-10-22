import { validateAdminMiddleware } from "../validateAdminMiddleware";
import type { Context } from "hono";
import { Messages } from "../../common/message";
import { describe, it, expect, beforeEach } from "bun:test";

describe("validateAdminMiddleware関数のテスト", () => {
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
    process.env.ADMIN_USER_ID = "admin-user-id";
  });

  const next = async () => {
    nextCalled = true;
  };

  it("未認証ユーザーの場合、401エラーを返す", async () => {
    // userId を設定しないことで未認証状態をシミュレート
    await validateAdminMiddleware(context, next);

    expect((context as any).responseBody).toEqual({ error: Messages.MSG_ERR_001 });
    expect((context as any).status).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it("管理者以外のユーザーの場合、401エラーを返す", async () => {
    // 管理者以外の userId を設定
    (context as any).headers = { userId: "non-admin-user-id" };
    await validateAdminMiddleware(context, next);

    expect((context as any).responseBody).toEqual({ error: Messages.MSG_ERR_002 });
    expect((context as any).status).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it("管理者ユーザーの場合、次のミドルウェアを呼び出す", async () => {
    // 管理者の userId を設定
    (context as any).headers = { userId: "admin-user-id" };
    await validateAdminMiddleware(context, next);

    expect((context as any).headers["userId"]).toBe("admin-user-id");
    expect(nextCalled).toBe(true);
  });
});
