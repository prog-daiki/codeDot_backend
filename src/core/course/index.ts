import { Hono } from "hono";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { HandleError } from "../../error/HandleError";
import { CourseUseCase } from "./useCase";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CourseNotFoundError } from "../../error/CourseNotFoundError";
import { Entity, Messages } from "../../common/message";
import { insertCourseSchema } from "../../../db/schema";
import { CategoryNotFoundError } from "../../error/CategoryNotFoundError";

const Course = new Hono<{
  Variables: {
    courseUseCase: CourseUseCase;
  };
}>().use("*", async (c, next) => {
  c.set("courseUseCase", new CourseUseCase());
  await next();
});

/**
 * 講座一覧取得API
 * @route GET /
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座一覧のJSONレスポンス
 * @throws {Error} 講座一覧取得に失敗した場合
 */
Course.get("/", validateAdminMiddleware, async (c) => {
  const courseUseCase = c.get("courseUseCase");
  try {
    const courses = await courseUseCase.getCourses();
    return c.json(courses);
  } catch (error) {
    return HandleError(c, error, "講座一覧取得エラー");
  }
});

/**
 * 講座取得API
 * @route GET /:course_id
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座取得に失敗した場合
 */
Course.get(
  "/:course_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.getCourse(courseId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座取得エラー");
    }
  },
);

/**
 * 講座登録API
 * @route POST /
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座登録に失敗した場合
 */
Course.post(
  "/",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ title: true })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.registerCourse(validatedData.title);
      return c.json(course);
    } catch (error) {
      return HandleError(c, error, "講座登録エラー");
    }
  },
);

/**
 * 講座タイトル編集API
 * @route PUT /:course_id/title
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座タイトル編集に失敗した場合
 */
Course.put(
  "/:course_id/title",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ title: true })),
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.updateCourseTitle(courseId, validatedData.title);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座タイトル編集エラー");
    }
  },
);

/**
 * 講座詳細編集API
 * @route PUT /:course_id/description
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座詳細編集に失敗した場合
 */
Course.put(
  "/:course_id/description",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ description: true })),
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.updateCourseDescription(
        courseId,
        validatedData.description,
      );
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座詳細編集エラー");
    }
  },
);

/**
 * 講座サムネイル編集API
 * @route PUT /:course_id/thumbnail
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座サムネイル編集に失敗した場合
 */
Course.put(
  "/:course_id/thumbnail",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ imageUrl: true })),
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.updateCourseThumbnail(courseId, validatedData.imageUrl);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座サムネイル編集エラー");
    }
  },
);

/**
 * 講座価格編集API
 * @route PUT /:course_id/price
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座価格編集に失敗した場合
 */
Course.put(
  "/:course_id/price",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ price: true })),
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.updateCoursePrice(courseId, validatedData.price);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座価格編集エラー");
    }
  },
);

/**
 * 講座カテゴリー編集API
 * @route PUT /:course_id/category
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座カテゴリー編集に失敗した場合
 */
Course.put(
  "/:course_id/category",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ categoryId: true })),
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.updateCourseCategory(courseId, validatedData.categoryId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      } else if (error instanceof CategoryNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.CATEGORY) }, 404);
      }
      return HandleError(c, error, "講座カテゴリー編集エラー");
    }
  },
);

/**
 * 講座ソースコード編集API
 * @route PUT /:course_id/source_url
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座ソースコード編集に失敗した場合
 */
Course.put(
  "/:course_id/source_url",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ sourceUrl: true })),
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.updateCourseSourceUrl(courseId, validatedData.sourceUrl);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座ソースコード編集エラー");
    }
  },
);

/**
 * 講座非公開API
 * @route PUT /:course_id/unpublish
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns {Promise<Response>} 講座のJSONレスポンス
 * @throws {Error} 講座非公開に失敗した場合
 */
Course.put(
  "/:course_id/unpublish",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.unpublishCourse(courseId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座非公開エラー");
    }
  },
);

export default Course;
