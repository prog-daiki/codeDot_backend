import { Hono } from "hono";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { HandleError } from "../../error/HandleError";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ChapterUseCase } from "./useCase";

const Chapter = new Hono<{
  Variables: {
    chapterUseCase: ChapterUseCase;
  };
}>().use("*", async (c, next) => {
  c.set("chapterUseCase", new ChapterUseCase());
  await next();
});

/**
 * チャプター一覧取得API
 * @route GET /courses/{course_id}/chapters
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} チャプター一覧
 * @throws {Error} チャプター一覧取得に失敗した場合
 */
Chapter.get(
  "/",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapters = await chapterUseCase.getChapters(courseId);
      return c.json(chapters);
    } catch (error) {
      return HandleError(c, error, "チャプター一覧取得エラー");
    }
  },
);

export default Chapter;
