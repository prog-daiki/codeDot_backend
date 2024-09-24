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
}
