import { Hono } from "hono";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { HandleError } from "../../error/HandleError";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ChapterUseCase } from "./useCase";
import { CourseNotFoundError } from "../../error/CourseNotFoundError";
import { Entity, Messages } from "../../common/message";
import { ChapterNotFoundError } from "../../error/ChapterNotFoundError";
import { insertChapterSchema } from "../../../db/schema";

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
 * @route GET /api/courses/{course_id}/chapters
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns チャプター一覧
 * @throws CourseNotFoundError
 * @throws チャプター一覧取得エラー
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
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json(Messages.MSG_ERR_003(Entity.COURSE), 404);
      }
      return HandleError(c, error, "チャプター一覧取得エラー");
    }
  },
);

/**
 * チャプター取得API
 * @route GET /api/courses/{course_id}/chapters/{chapter_id}
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns チャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws チャプター取得エラー
 */
Chapter.get(
  "/:chapter_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string(), chapter_id: z.string() })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.getChapter(courseId, chapterId);
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json(Messages.MSG_ERR_003(Entity.COURSE), 404);
      } else if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json(Messages.MSG_ERR_003(Entity.CHAPTER), 404);
      }
      return HandleError(c, error, "チャプター取得エラー");
    }
  },
);

/**
 * チャプター登録API
 * @route POST /api/courses/{course_id}/chapters
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns チャプター
 * @throws CourseNotFoundError
 * @throws チャプター登録エラー
 */
Chapter.post(
  "/",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  zValidator("json", insertChapterSchema.pick({ title: true })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const validatedData = c.req.valid("json");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.registerChapter(courseId, validatedData.title);
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json(Messages.MSG_ERR_003(Entity.COURSE), 404);
      }
      return HandleError(c, error, "チャプター登録エラー");
    }
  },
);

export default Chapter;
