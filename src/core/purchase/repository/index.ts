import { and, eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { purchase } from "../../../../db/schema";
import { createId } from "@paralleldrive/cuid2";
import { getCurrentJstDate } from "../../../common/date";

/**
 * 購入情報のリポジトリを管理するクラス
 */
export class PurchaseRepository {
  /**
   * 購入情報が存在するかを確認する
   * @param courseId 講座ID
   * @param userId ユーザーID
   * @returns 購入情報が存在するか
   */
  async existsPurchase(courseId: string, userId: string) {
    const result = await db
      .select()
      .from(purchase)
      .where(and(eq(purchase.courseId, courseId), eq(purchase.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  /**
   * 購入情報を登録する
   * @param courseId 講座ID
   * @param userId ユーザーID
   */
  async registerPurchase(courseId: string, userId: string) {
    const currentJstDate = getCurrentJstDate();
    await db.insert(purchase).values({
      id: createId(),
      createDate: currentJstDate,
      updateDate: currentJstDate,
      courseId,
      userId,
    });
  }
}
