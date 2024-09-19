import { desc, eq } from "drizzle-orm";
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
    const data = await db.select().from(course).orderBy(desc(course.createDate));
    return data;
  }

  /**
   * 指定されたIDの講座を取得する
   * @param courseId 講座ID
   * @returns {Promise<Course | null>} 講座オブジェクト、存在しない場合はnull
   */
  async getCourseById(courseId: string): Promise<Course> {
    const [data] = await db.select().from(course).where(eq(course.id, courseId));
    return data;
  }

  /**
   * 講座の存在チェック
   * @param courseId 講座ID
   * @returns {Promise<boolean>} 講座が存在する場合はtrue、そうでない場合はfalse
   */
  async isCourseExist(courseId: string): Promise<boolean> {
    const course = await this.getCourseById(courseId);
    return !!course;
  }
}
