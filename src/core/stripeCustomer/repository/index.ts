import { eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { stripeCustomer } from "../../../../db/schema";
import { getCurrentJstDate } from "../../../common/date";
import { createId } from "@paralleldrive/cuid2";

/**
 * Stripe顧客情報のリポジトリを管理するクラス
 */
export class StripeCustomerRepository {
  /**
   * Stripe顧客情報を取得する
   * @param userId ユーザーID
   * @returns Stripe顧客情報
   */
  async getStripeCustomer(userId: string) {
    const [customer] = await db
      .select()
      .from(stripeCustomer)
      .where(eq(stripeCustomer.userId, userId));
    return customer;
  }

  async registerStripeCustomer(userId: string, stripeCustomerId: string) {
    const currentJstDate = getCurrentJstDate();
    const [data] = await db
      .insert(stripeCustomer)
      .values({
        id: createId(),
        createDate: currentJstDate,
        updateDate: currentJstDate,
        userId,
        stripeCustomerId,
      })
      .returning();
    return data;
  }
}
