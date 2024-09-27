import { asc, eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { chapter } from "../../../../db/schema";
import type { Chapter } from "../types";
import { getCurrentJstDate } from "../../../common/date";
import { createId } from "@paralleldrive/cuid2";

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
    const data = await db
      .select()
      .from(chapter)
      .where(eq(chapter.courseId, courseId))
      .orderBy(asc(chapter.position));
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

  /**
   * チャプターを登録する
   * @param courseId 講座ID
   * @param title チャプター名
   * @returns チャプター
   */
  async registerChapter(courseId: string, title: string): Promise<Chapter> {
    const currentJstDate = getCurrentJstDate();
    const chapters = await this.getChapters(courseId);
    const newPosition = chapters.length > 0 ? chapters[chapters.length - 1].position + 1 : 1;
    const [data] = await db
      .insert(chapter)
      .values({
        id: createId(),
        courseId,
        title,
        position: newPosition,
        createDate: currentJstDate,
        updateDate: currentJstDate,
      })
      .returning();
    return data;
  }
}
