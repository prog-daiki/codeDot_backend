import { Hono } from "hono";
import { validateAuthMiddleware } from "../../auth/validateAuthMiddelware";
import { HandleError } from "../../error/HandleError";
import { CategoryUseCase } from "./useCase";
import { insertCategorySchema } from "../../../db/schema";
import { zValidator } from "@hono/zod-validator";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { z } from "zod";
import { Entity, Messages } from "../../common/message";
import { CategoryNotFoundError } from "../../error/CategoryNotFoundError";

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
 * @route GET /api/categories
 * @middleware validateAuthMiddleware - 認証されたユーザーか検証
 * @returns カテゴリーのJSONレスポンス
 * @throws CategoryNotFoundError
 * @throws カテゴリー一覧取得エラー
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
 * @route POST /api/categories
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 登録したカテゴリー
 * @throws カテゴリー登録エラー
 */
Category.post(
  "/",
  validateAdminMiddleware,
  zValidator("json", insertCategorySchema.pick({ name: true })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const categoryUseCase = c.get("categoryUseCase");
    try {
      const category = await categoryUseCase.registerCategory(validatedData.name);
      return c.json(category);
    } catch (error) {
      return HandleError(c, error, "カテゴリー登録エラー");
    }
  },
);

/**
 * カテゴリー編集API
 * @route PUT /api/categories/:category_id
 * @middleware validateAdminMiddleware - 管理者のみアクセス可能
 * @returns 更新したカテゴリー
 * @throws CategoryNotFoundError
 * @throws カテゴリー編集エラー
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
      const category = await categoryUseCase.updateCategoryName(categoryId, validatedData.name);
      return c.json(category);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        console.error(`存在しないカテゴリーです: ID ${categoryId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CATEGORY) }, 404);
      }
      return HandleError(c, error, "カテゴリー編集エラー");
    }
  },
);

/**
 * カテゴリー削除API
 * @route DELETE /categories/:category_id
 * @middleware validateAdminMiddleware - 管理者のみアクセス可能
 * @returns {Promise<Response>} カテゴリーのJSONレスポンス
 * @throws {Error} カテゴリー削除に失敗した場合
 */
Category.delete(
  "/:category_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ category_id: z.string() })),
  async (c) => {
    const { category_id: categoryId } = c.req.valid("param");
    const categoryUseCase = c.get("categoryUseCase");
    try {
      const category = await categoryUseCase.deleteCategory(categoryId);
      return c.json(category);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.CATEGORY) }, 404);
      }
      return HandleError(c, error, "カテゴリー削除エラー");
    }
  },
);

export default Category;
