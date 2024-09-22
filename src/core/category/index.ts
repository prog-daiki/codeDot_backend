import { Hono } from "hono";
import { validateAuthMiddleware } from "../../auth/validateAuthMiddelware";
import { HandleError } from "../../error/HandleError";
import { CategoryUseCase } from "./useCase";
import { insertCategorySchema } from "../../../db/schema";
import { zValidator } from "@hono/zod-validator";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { z } from "zod";

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
 * @middleware validateAuthMiddleware - 認証済みのユーザーのみアクセス可能
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

/**
 * カテゴリー登録API
 * @route POST /categories
 * @middleware validateAuthMiddleware - 認証済みのユーザーのみアクセス可能
 * @returns {Promise<Response>} カテゴリーのJSONレスポンス
 * @throws {Error} カテゴリー登録に失敗した場合
 */
Category.post(
  "/",
  validateAdminMiddleware,
  zValidator("json", insertCategorySchema.pick({ name: true })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const categoryUseCase = c.get("categoryUseCase");
    try {
      const categories = await categoryUseCase.registerCategory(validatedData.name);
      return c.json(categories);
    } catch (error) {
      return HandleError(c, error, "カテゴリー登録エラー");
    }
  },
);

/**
 * カテゴリー編集API
 * @route PUT /categories/:category_id
 * @middleware validateAdminMiddleware - 認証済みのユーザーのみアクセス可能
 * @returns {Promise<Response>} カテゴリーのJSONレスポンス
 * @throws {Error} カテゴリー更新に失敗した場合
 */
Category.put(
  "/:category_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ category_id: z.string() })),
  zValidator("json", insertCategorySchema.pick({ name: true })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { category_id: categoryId } = c.req.valid("param");
    const categoryUseCase = c.get("categoryUseCase");
    try {
      const categories = await categoryUseCase.updateCategoryName(categoryId, validatedData.name);
      return c.json(categories);
    } catch (error) {
      return HandleError(c, error, "カテゴリー更新エラー");
    }
  },
);

export default Category;
