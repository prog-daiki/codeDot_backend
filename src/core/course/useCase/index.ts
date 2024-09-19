import { CourseNotFoundError } from "../../../error/CourseNotFoundError";
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

  /**
   * 講座を取得する
   * @param courseId 講座ID
   * @returns 講座
   */
  async getCourse(courseId: string): Promise<Course> {
    // 講座の存在チェック
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    return course;
  }

  /**
   * 講座を登録する
   * @param title 講座のタイトル
   * @returns 登録された講座
   */
  async registerCourse(title: string): Promise<Course> {
    return await this.courseRepository.registerCourse(title);
  }

  /**
   * 講座のタイトルを更新する
   * @param courseId 講座ID
   * @param title 講座のタイトル
   * @returns 更新された講座
   */
  async updateCourseTitle(courseId: string, title: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { title });
  }

  /**
   * 講座の詳細を更新する
   * @param courseId 講座ID
   * @param description 講座の詳細
   * @returns 更新された講座
   */
  async updateCourseDescription(courseId: string, description: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { description });
  }

  /**
   * 講座のサムネイルを更新する
   * @param courseId 講座ID
   * @param imageUrl 講座のサムネイル
   * @returns 更新された講座
   */
  async updateCourseThumbnail(courseId: string, imageUrl: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { imageUrl });
  }

  /**
   * 講座の価格を更新する
   * @param courseId 講座ID
   * @param price 講座の価格
   * @returns 更新された講座
   */
  async updateCoursePrice(courseId: string, price: number): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { price });
  }

  /**
   * 講座のソースコードを更新する
   * @param courseId 講座ID
   * @param sourceUrl 講座のソースコード
   * @returns 更新された講座
   */
  async updateCourseSourceUrl(courseId: string, sourceUrl: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { sourceUrl });
  }
}
