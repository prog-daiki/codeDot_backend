import { Hono } from "hono";
import { validateAuthMiddleware } from "../../auth/validateAuthMiddelware";
import { HandleError } from "../../error/HandleError";
import { CategoryUseCase } from "./useCase";

const Category = new Hono<{
  Variables: {
    categoryUseCase: CategoryUseCase;
  };
}>().use("*", async (c, next) => {
  c.set("categoryUseCase", new CategoryUseCase());
  await next();
});

/**
 * カテゴリー一覧取得API
 * @route GET /categories
 * @middleware validateAuth - 認証済みのユーザーのみアクセス可能
 * @returns {Promise<Response>} カテゴリーのJSONレスポンス
 * @throws {Error} カテゴリー一覧取得に失敗した場合
 */
Category.get("/", validateAuthMiddleware, async (c) => {
  const categoryUseCase = c.get("categoryUseCase");
  try {
    const categories = await categoryUseCase.getCategories();
    return c.json(categories);
  } catch (error) {
    return HandleError(c, error, "カテゴリー一覧取得エラー");
  }
});

export default Category;
