import { eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { chapter } from "../../../../db/schema";
import type { Chapter } from "../types";

/**
 * チャプターのリポジトリを管理するクラス
 */
export class ChapterRepository {
  /**
   * 講座に紐づくチャプター一覧を取得する
   * @param courseId 講座ID
   * @returns チャプター一覧
   */
  async getChapters(courseId: string): Promise<Chapter[]> {
    const data = await db.select().from(chapter).where(eq(chapter.courseId, courseId));
    return data;
  }

  /**
   * チャプターの存在チェック
   * @param chapterId チャプターID
   * @returns {Promise<boolean>} チャプターが存在する場合はtrue、そうでない場合はfalse
   */
  async isChapterExists(chapterId: string): Promise<boolean> {
    const chapter = await this.getChapterById(chapterId);
    return !!chapter;
  }

  /**
   * チャプターを取得する
   * @param chapterId チャプターID
   * @returns チャプター
   */
  async getChapterById(chapterId: string): Promise<Chapter> {
    const [data] = await db.select().from(chapter).where(eq(chapter.id, chapterId));
    return data;
  }
}
