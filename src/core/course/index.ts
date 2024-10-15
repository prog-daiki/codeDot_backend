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
import { CourseRequiredFieldsEmptyError } from "../../error/CourseRequiredFieldsEmptyError";
import { getAuth } from "@hono/clerk-auth";
import { validateAuthMiddleware } from "../../auth/validateAuthMiddelware";
import type { AdminCourse } from "./types/admin-course";
import type { Course } from "./types";

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
 * @route GET /api/courses
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 講座一覧
 * @throws 講座一覧取得エラー
 */
Course.get("/", validateAdminMiddleware, async (c) => {
  const courseUseCase = c.get("courseUseCase");
  try {
    const courses: AdminCourse[] = await courseUseCase.getCourses();
    console.log(`講座一覧を取得しました: ${courses.length}件`);
    return c.json(courses);
  } catch (error) {
    return HandleError(c, error, "講座一覧取得エラーが発生しました。");
  }
});

/**
 * 公開講座一覧取得API
 * @route GET /api/courses/publish
 * @middleware validateAuthMiddleware - ユーザー権限の検証
 * @returns 公開講座一覧
 * @throws 公開講座一覧取得エラー
 */
Course.get(
  "/publish",
  validateAuthMiddleware,
  zValidator(
    "query",
    z.object({
      title: z.string().optional(),
      categoryId: z.string().optional(),
    }),
  ),
  async (c) => {
    const courseUseCase = c.get("courseUseCase");
    const validatedData = c.req.valid("query");
    const auth = getAuth(c);
    try {
      const courses = await courseUseCase.getPublishCourses(
        auth!.userId!,
        validatedData.title,
        validatedData.categoryId,
      );
      return c.json(courses);
    } catch (error) {
      return HandleError(c, error, "公開講座一覧取得エラー");
    }
  },
);

/**
 * 講座取得API
 * @route GET /api/courses/:course_id
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 講座
 * @throws CourseNotFoundError
 * @throws 講座取得エラー
 */
Course.get(
  "/:course_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course: Course = await courseUseCase.getCourse(courseId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座取得エラー");
    }
  },
);

/**
 * 公開講座取得API
 * @route GET /api/courses/:course_id
 * @middleware validateAuthMiddleware - ユーザー権限の検証
 * @returns 公開講座
 * @throws CourseNotFoundError
 * @throws 公開講座取得エラー
 */
Course.get(
  "/:course_id/publish",
  validateAuthMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    const auth = getAuth(c);
    try {
      const course = await courseUseCase.getPublishCourse(courseId, auth!.userId!);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "公開講座取得エラー");
    }
  },
);

/**
 * 講座登録API
 * @route POST /api/courses
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 登録した講座
 * @throws 講座登録エラー
 */
Course.post(
  "/",
  validateAdminMiddleware,
  zValidator("json", insertCourseSchema.pick({ title: true })),
  async (c) => {
    const validatedData = c.req.valid("json");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course: Course = await courseUseCase.registerCourse(validatedData.title);
      return c.json(course);
    } catch (error) {
      return HandleError(c, error, "講座登録エラー");
    }
  },
);

/**
 * 講座タイトル編集API
 * @route PUT /api/courses/:course_id/title
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座タイトル編集エラー
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
      const course: Course = await courseUseCase.updateCourseTitle(courseId, validatedData.title);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座タイトル編集エラー");
    }
  },
);

/**
 * 講座詳細編集API
 * @route PUT /api/courses/:course_id/description
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座詳細編集エラー
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
      const course: Course = await courseUseCase.updateCourseDescription(
        courseId,
        validatedData.description,
      );
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座詳細編集エラー");
    }
  },
);

/**
 * 講座サムネイル編集API
 * @route PUT /api/courses/:course_id/thumbnail
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座サムネイル編集エラー
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
      const course: Course = await courseUseCase.updateCourseThumbnail(courseId, validatedData.imageUrl);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座サムネイル編集エラー");
    }
  },
);

/**
 * 講座価格編集API
 * @route PUT /api/courses/:course_id/price
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座価格編集エラー
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
      const course: Course = await courseUseCase.updateCoursePrice(courseId, validatedData.price);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座価格編集エラー");
    }
  },
);

/**
 * 講座カテゴリー編集API
 * @route PUT /api/courses/:course_id/category
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座カテゴリー編集エラー
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
      const course: Course = await courseUseCase.updateCourseCategory(courseId, validatedData.categoryId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      } else if (error instanceof CategoryNotFoundError) {
        console.error(`存在しないカテゴリーです: ID ${validatedData.categoryId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.CATEGORY) }, 404);
      }
      return HandleError(c, error, "講座カテゴリー編集エラー");
    }
  },
);

/**
 * 講座ソースコード編集API
 * @route PUT /api/courses/:course_id/source_url
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座ソースコード編集エラー
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
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座ソースコード編集エラー");
    }
  },
);

/**
 * 講座非公開API
 * @route PUT /api/courses/:course_id/unpublish
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws 講座非公開エラー
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
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座非公開エラー");
    }
  },
);

/**
 * 講座公開API
 * @route PUT /api/courses/:course_id/publish
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 更新した講座
 * @throws CourseNotFoundError
 * @throws CourseRequiredFieldsEmptyError
 * @throws 講座公開エラー
 */
Course.put(
  "/:course_id/publish",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.publishCourse(courseId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      if (error instanceof CourseRequiredFieldsEmptyError) {
        return c.json({ error: Messages.MSG_ERR_004 }, 400);
      }
      return HandleError(c, error, "講座公開エラー");
    }
  },
);

/**
 * 講座削除API
 * @route DELETE /api/courses/:course_id
 * @middleware validateAdminMiddleware - 管理者権限の検証
 * @returns 削除した講座
 * @throws CourseNotFoundError
 * @throws 講座削除エラー
 */
Course.delete(
  "/:course_id",
  validateAdminMiddleware,
  zValidator("param", z.object({ course_id: z.string() })),
  async (c) => {
    const { course_id: courseId } = c.req.valid("param");
    const courseUseCase = c.get("courseUseCase");
    try {
      const course = await courseUseCase.deleteCourse(courseId);
      return c.json(course);
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        console.error(`存在しない講座です: ID ${courseId}`);
        return c.json({ error: Messages.MSG_ERR_003(Entity.COURSE) }, 404);
      }
      return HandleError(c, error, "講座公開エラー");
    }
  },
);

export default Course;
