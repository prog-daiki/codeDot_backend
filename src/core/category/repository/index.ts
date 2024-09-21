import { asc } from "drizzle-orm";
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
}
