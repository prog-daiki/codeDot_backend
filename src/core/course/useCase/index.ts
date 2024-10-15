import Mux from "@mux/mux-node";
import { CategoryNotFoundError } from "../../../error/CategoryNotFoundError";
import { CourseNotFoundError } from "../../../error/CourseNotFoundError";
import { CourseRequiredFieldsEmptyError } from "../../../error/CourseRequiredFieldsEmptyError";
import { CategoryRepository } from "../../category/repository";
import { ChapterRepository } from "../../chapter/repository";
import { CourseRepository } from "../repository";
import type { Course } from "../types";
import type { AdminCourse } from "../types/admin-course";
import type { PublishCourse } from "../types/publish-course";
import { MuxDataRepository } from "../../muxData/repository";
import type { Chapter } from "../../chapter/types";
import type { MuxData } from "../../muxData/types";
import type { PublishCourseWithMuxData } from "../types/publish-course-with-muxData";

/**
 * 講座に関するユースケースを管理するクラス
 */
export class CourseUseCase {
  private courseRepository: CourseRepository;
  private categoryRepository: CategoryRepository;
  private chapterRepository: ChapterRepository;
  private muxDataRepository: MuxDataRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.categoryRepository = new CategoryRepository();
    this.chapterRepository = new ChapterRepository();
    this.muxDataRepository = new MuxDataRepository();
  }

  /**
   * 講座一覧を取得する
   * @returns 講座一覧
   */
  async getCourses(): Promise<AdminCourse[]> {
    return await this.courseRepository.getAllCourses();
  }

  /**
   * 講座を取得する
   * @param courseId 講座ID
   * @returns 講座
   */
  async getCourse(courseId: string): Promise<Course> {
    // 講座の存在チェック
    const course: Course = await this.courseRepository.getCourseById(courseId);
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
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
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
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
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
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
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
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { price });
  }

  /**
   * 講座のカテゴリーを更新する
   * @param courseId 講座ID
   * @param categoryId カテゴリーID
   * @returns 更新された講座
   */
  async updateCourseCategory(courseId: string, categoryId: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // カテゴリーの存在チェック
    const isCategoryExists: boolean = await this.categoryRepository.isCategoryExists(categoryId);
    if (!isCategoryExists) {
      throw new CategoryNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { categoryId });
  }

  /**
   * 講座のソースコードを更新する
   * @param courseId 講座ID
   * @param sourceUrl 講座のソースコード
   * @returns 更新された講座
   */
  async updateCourseSourceUrl(courseId: string, sourceUrl: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { sourceUrl });
  }

  /**
   * 講座を非公開にする
   * @param courseId 講座ID
   * @returns 非公開にされた講座
   */
  async unpublishCourse(courseId: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.updateCourse(courseId, { publishFlag: false });
  }

  /**
   * 講座を公開する
   * @param courseId 講座ID
   * @returns 公開された講座
   */
  async publishCourse(courseId: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // 講座と公開されているチャプターを取得する
    const course: Course = await this.courseRepository.getCourseById(courseId);
    const publishChapters: Chapter[] = await this.chapterRepository.getPublishChapters(courseId);

    // 講座の必須項目を満たしているかチェック
    if (
      publishChapters.length === 0 ||
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId ||
      course.price === null
    ) {
      throw new CourseRequiredFieldsEmptyError();
    }

    const updatedCourse: Course = await this.courseRepository.updateCourse(courseId, {
      publishFlag: true,
    });
    return updatedCourse;
  }

  /**
   * 公開講座一覧を取得する
   * @param title 講座のタイトル
   * @param categoryId カテゴリーID
   * @param userId ユーザーID
   * @returns 公開講座一覧
   */
  async getPublishCourses(
    userId: string,
    title?: string,
    categoryId?: string,
  ): Promise<PublishCourse[]> {
    return await this.courseRepository.getPublishCourses(userId, title, categoryId);
  }

  /**
   * 講座を削除する
   * @param courseId 講座ID
   * @returns 削除された講座
   */
  async deleteCourse(courseId: string): Promise<Course> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // Muxの講座に関連するデータを削除する
    const { video }: Mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });
    const muxDataList: MuxData[] = await this.muxDataRepository.getMuxDataByCourseId(courseId);
    if (muxDataList.length > 0) {
      for (const muxData of muxDataList) {
        await video.assets.delete(muxData.assetId);
      }
    }

    return await this.courseRepository.deleteCourse(courseId);
  }

  /**
   * 公開講座を取得する
   * @param courseId 講座ID
   * @returns 公開講座
   */
  async getPublishCourse(courseId: string, userId?: string): Promise<PublishCourseWithMuxData> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.courseRepository.getPublishCourse(courseId, userId);
  }
}
