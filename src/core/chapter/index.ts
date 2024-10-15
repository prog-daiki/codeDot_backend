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
import { MuxDataNotFoundError } from "../../error/MuxDataNotFoundError";
import { ChapterRequiredFieldsEmptyError } from "../../error/ChapterRequiredFieldsEmptyError";
import type { Chapter } from "./types";
import type { ChapterWithMuxData } from "./types/ChapterWithMuxData";

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
      const chapters: Chapter[] = await chapterUseCase.getChapters(courseId);
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
      const chapter: ChapterWithMuxData = await chapterUseCase.getChapter(courseId, chapterId);
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
      const chapter: Chapter = await chapterUseCase.registerChapter(courseId, validatedData.title);
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

/**
 * チャプタータイトル編集API
 * @route PUT /api/courses/{course_id}/chapters/{chapter_id}/title
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新したチャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws チャプタータイトル編集エラー
 */
Chapter.put(
  "/:chapter_id/title",
  validateAdminMiddleware,
  zValidator("param", z.object({ chapter_id: z.string(), course_id: z.string() })),
  zValidator("json", insertChapterSchema.pick({ title: true })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const validatedData = c.req.valid("json");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.updateChapterTitle(
        courseId,
        chapterId,
        validatedData.title,
      );
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CHAPTER) }, 404);
      }
      return HandleError(c, error, "チャプタータイトル編集エラー");
    }
  },
);

/**
 * チャプター詳細編集API
 * @route PUT /api/courses/{course_id}/chapters/{chapter_id}/description
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新したチャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws チャプター詳細編集エラー
 */
Chapter.put(
  "/:chapter_id/description",
  validateAdminMiddleware,
  zValidator("param", z.object({ chapter_id: z.string(), course_id: z.string() })),
  zValidator("json", insertChapterSchema.pick({ description: true })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const validatedData = c.req.valid("json");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.updateChapterDescription(
        courseId,
        chapterId,
        validatedData.description,
      );
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CHAPTER) }, 404);
      }
      return HandleError(c, error, "チャプター詳細編集エラー");
    }
  },
);

/**
 * チャプター動画編集API
 * @route PUT /api/courses/{course_id}/chapters/{chapter_id}/video
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新したチャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws チャプター動画編集エラー
 */
Chapter.put(
  "/:chapter_id/video",
  validateAdminMiddleware,
  zValidator("param", z.object({ chapter_id: z.string(), course_id: z.string() })),
  zValidator("json", insertChapterSchema.pick({ videoUrl: true })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const validatedData = c.req.valid("json");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.updateChapterVideo(
        courseId,
        chapterId,
        validatedData.videoUrl,
      );
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CHAPTER) }, 404);
      }
      return HandleError(c, error, "チャプター動画編集エラー");
    }
  },
);

/**
 * チャプター並び替えAPI
 * @route PUT /api/courses/{course_id}/chapters/reorder
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 200
 * @throws CourseNotFoundError
 * @throws チャプター並び替えエラー
 */
Chapter.put(
  "/reorder",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  zValidator(
    "json",
    z.object({
      list: z.array(z.object({ id: z.string(), position: z.number() })),
    }),
  ),
  async (c) => {
    const { list } = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      await chapterUseCase.reorderChapters(courseId, list);
      return c.json({ status: 200 });
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "チャプター並び替えエラー");
    }
  },
);

/**
 * チャプター削除API
 * @route DELETE /api/courses/{course_id}/chapters/{chapter_id}
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 削除したチャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws チャプター削除エラー
 */
Chapter.delete(
  "/:chapter_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ chapter_id: z.string(), course_id: z.string() })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.deleteChapter(courseId, chapterId);
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CHAPTER) }, 404);
      }
      return HandleError(c, error, "チャプター削除エラー");
    }
  },
);

/**
 * チャプター非公開API
 * @route PUT /api/courses/{course_id}/chapters/{chapter_id}/unpublish
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 非公開したチャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws チャプター非公開エラー
 */
Chapter.put(
  "/:chapter_id/unpublish",
  validateAdminMiddleware,
  zValidator("param", z.object({ chapter_id: z.string(), course_id: z.string() })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.unpublishChapter(courseId, chapterId);
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CHAPTER) }, 404);
      }
      return HandleError(c, error, "チャプター非公開エラー");
    }
  },
);

/**
 * チャプター公開API
 * @route PUT /api/courses/{course_id}/chapters/{chapter_id}/publish
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 公開したチャプター
 * @throws CourseNotFoundError
 * @throws ChapterNotFoundError
 * @throws MuxDataNotFoundError
 * @throws ChapterRequiredFieldsEmptyError
 * @throws チャプター公開エラー
 */
Chapter.put(
  "/:chapter_id/publish",
  validateAdminMiddleware,
  zValidator("param", z.object({ chapter_id: z.string(), course_id: z.string() })),
  async (c) => {
    const { course_id: courseId, chapter_id: chapterId } = c.req.valid("param");
    const chapterUseCase = c.get("chapterUseCase");
    try {
      const chapter = await chapterUseCase.publishChapter(courseId, chapterId);
      return c.json(chapter);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof ChapterNotFoundError) {
        console.error(`存在しないチャプターです: ID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CHAPTER) }, 404);
      }
      if (error instanceof MuxDataNotFoundError) {
        console.error(`Muxデータが存在しません: チャプターID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.MUXDATA) }, 404);
      }
      if (error instanceof ChapterRequiredFieldsEmptyError) {
        console.error(`チャプターの必須フィールドが空です: チャプターID ${chapterId}`);
        return c.json({ error: Messages.MSG_ERR_004 }, 400);
      }
      return HandleError(c, error, "チャプター公開エラー");
    }
  },
);

export default Chapter;
