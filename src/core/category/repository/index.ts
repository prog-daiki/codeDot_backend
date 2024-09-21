import { asc, eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { category } from "../../../../db/schema";
import type { Category } from "../types";

/**
 * カテゴリーのリポジトリを管理するクラス
 */
export class CategoryRepository {
  /**
   * 全てのカテゴリーをカテゴリー名の昇順で取得する
   * @returns {Promise<Category[]>} カテゴリーの配列
   */
  async getCategories(): Promise<Category[]> {
    const data = await db.select().from(category).orderBy(asc(category.name));
    return data;
  }

  /**
   * カテゴリーをIDで取得する
   * @param id カテゴリーのID
   * @returns {Promise<Category | null>} カテゴリーのオブジェクト
   */
  async getCategoryById(id: string): Promise<Category | null> {
    const [data] = await db.select().from(category).where(eq(category.id, id));
    return data;
  }

  /**
   * カテゴリーが存在するかを確認する
   * @param id カテゴリーのID
   * @returns {Promise<boolean>} カテゴリーが存在するかどうか
   */
  async isCategoryExists(id: string): Promise<boolean> {
    const category = await this.getCategoryById(id);
    return !!category;
  }
}
