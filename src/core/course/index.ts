import { Hono } from "hono";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { HandleError } from "../../error/HandleError";
import { CourseUseCase } from "./useCase";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CourseNotFoundError } from "../../error/CourseNotFoundError";
import { Entity, Messages } from "../../common/message";
import { insertCourseSchema } from "../../../db/schema";

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

export default Course;
