import { eq } from "drizzle-orm";
import { db } from "../../../../db/drizzle";
import { muxData } from "../../../../db/schema";
import type { MuxData } from "../types";
import { createId } from "@paralleldrive/cuid2";

/**
 * MuxDataを管理するリポジトリ
 */
export class MuxDataRepository {
  /**
   * チャプターのmuxDataの存在チェック
   * @param chapterId
   * @returns
   */
  async checkMuxDataExists(chapterId: string): Promise<MuxData | null> {
    const [existMuxData] = await db.select().from(muxData).where(eq(muxData.chapterId, chapterId));
    return existMuxData;
  }

  /**
   * muxDataを削除する
   * @param chapterId
   */
  async deleteMuxData(chapterId: string): Promise<void> {
    await db.delete(muxData).where(eq(muxData.chapterId, chapterId));
  }

  /**
   * muxDataを登録する
   * @param chapterId
   * @param assetId
   */
  async registerMuxData(chapterId: string, assetId: string, playbackId: string) {
    await db.insert(muxData).values({
      id: createId(),
      chapterId,
      assetId,
      playbackId,
    });
  }
}