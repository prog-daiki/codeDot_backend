import { desc, eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { course } from "../../../../db/schema";
import type { Course } from "../types";
import { createId } from "@paralleldrive/cuid2";
import { getCurrentJstDate } from "../../../common/date";

/**
 * 講座のリポジトリを管理するクラス
 */
export class CourseRepository {
  /**
   * 全ての講座を作成日の降順で取得する
   * @returns {Promise<Course[]>} 講座一覧
   */
  async getAllCoursesSortedByCreateDate(): Promise<Course[]> {
    const data = await db.select().from(course).orderBy(desc(course.createDate));
    return data;
  }

  /**
   * 指定されたIDの講座を取得する
   * @param courseId 講座ID
   * @returns {Promise<Course | null>} 講座
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
  async isCourseExists(courseId: string): Promise<boolean> {
    const course = await this.getCourseById(courseId);
    return !!course;
  }

  /**
   * 講座を登録する
   * @param title 講座のタイトル
   * @returns {Promise<Course>} 登録された講座オブジェクト
   */
  async registerCourse(title: string): Promise<Course> {
    const currentJstDate = getCurrentJstDate();
    const [data] = await db
      .insert(course)
      .values({
        id: createId(),
        title,
        createDate: currentJstDate,
        updateDate: currentJstDate,
      })
      .returning();
    return data;
  }

  /**
   * 講座を更新する
   * @param courseId 講座ID
   * @param updateData 更新するデータ
   * @returns 更新された講座
   */
  async updateCourse(
    courseId: string,
    updateData: Partial<Omit<typeof course.$inferInsert, "id" | "createDate">>,
  ) {
    const currentJstDate = getCurrentJstDate();
    const [data] = await db
      .update(course)
      .set({
        ...updateData,
        updateDate: currentJstDate,
      })
      .where(eq(course.id, courseId))
      .returning();
    return data;
  }
}
