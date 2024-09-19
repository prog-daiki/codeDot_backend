import { desc } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { course } from "../../../../db/schema";
import type { Course } from "../types";

/**
 * 講座のリポジトリを管理するクラス
 */
export class CourseRepository {
  /**
   * 全ての講座を作成日の降順で取得する
   * @returns {Promise<Course[]>} 講座の配列
   */
  async getAllCoursesSortedByCreateDate(): Promise<Course[]> {
    const data = await db
      .select()
      .from(course)
      .orderBy(desc(course.createDate));
    return data;
  }
}
