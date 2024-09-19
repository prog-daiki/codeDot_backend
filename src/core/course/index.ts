import { Hono } from "hono";
import { validateAdminMiddleware } from "../../auth/validateAdminMiddleware";
import { HandleError } from "../../error/HandleError";
import { CourseUseCase } from "./useCase";

const Course = new Hono<{
  Variables: {
    courseUseCase: CourseUseCase;
  };
}>().use("*", async (c, next) => {
  c.set("courseUseCase", new CourseUseCase());
  await next();
});

/**
 * 講座一覧を取得するAPI
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

export default Course;
