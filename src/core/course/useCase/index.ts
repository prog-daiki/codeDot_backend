import { CourseRepository } from "../repository";
import type { Course } from "../types";

/**
 * 講座に関するユースケースを管理するクラス
 */
export class CourseUseCase {
  private courseRepository: CourseRepository;
  constructor() {
    this.courseRepository = new CourseRepository();
  }

  /**
   * 講座一覧を取得する
   * @returns 講座一覧
   */
  async getCourses(): Promise<Course[]> {
    return await this.courseRepository.getAllCoursesSortedByCreateDate();
  }
}
