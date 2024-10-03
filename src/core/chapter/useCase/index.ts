import { ChapterNotFoundError } from "../../../error/ChapterNotFoundError";
import { CourseNotFoundError } from "../../../error/CourseNotFoundError";
import { CourseRepository } from "../../course/repository";
import { ChapterRepository } from "../repository";
import type { Chapter } from "../types";

/**
 * チャプターに関するユースケースを管理するクラス
 */
export class ChapterUseCase {
  private chapterRepository: ChapterRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.chapterRepository = new ChapterRepository();
    this.courseRepository = new CourseRepository();
  }

  /**
   * チャプター一覧を取得する
   * @param courseId 講座ID
   * @returns チャプター一覧
   */
  async getChapters(courseId: string): Promise<Chapter[]> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }
    return await this.chapterRepository.getChapters(courseId);
  }

  /**
   * チャプターを取得する
   * @param courseId 講座ID
   * @param chapterId チャプターID
   * @returns チャプター
   */
  async getChapter(courseId: string, chapterId: string): Promise<Chapter> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // チャプターの存在チェック
    const isChapterExists = await this.chapterRepository.isChapterExists(chapterId);
    if (!isChapterExists) {
      throw new ChapterNotFoundError();
    }

    return await this.chapterRepository.getChapterById(chapterId);
  }

  /**
   * チャプターを登録する
   * @param courseId 講座ID
   * @param title チャプター名
   * @returns チャプター
   */
  async registerChapter(courseId: string, title: string): Promise<Chapter> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    return await this.chapterRepository.registerChapter(courseId, title);
  }

  /**
   * チャプターのタイトルを更新する
   * @param courseId 講座ID
   * @param chapterId チャプターID
   * @param title チャプター名
   */
  async updateChapterTitle(courseId: string, chapterId: string, title: string): Promise<Chapter> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // チャプターの存在チェック
    const isChapterExists = await this.chapterRepository.isChapterExists(chapterId);
    if (!isChapterExists) {
      throw new ChapterNotFoundError();
    }

    return await this.chapterRepository.updateChapter(chapterId, { title });
  }

  /**
   * チャプターの詳細を更新する
   * @param courseId 講座ID
   * @param chapterId チャプターID
   * @param description チャプター詳細
   * @returns 更新したチャプター
   */
  async updateChapterDescription(
    courseId: string,
    chapterId: string,
    description: string,
  ): Promise<Chapter> {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // チャプターの存在チェック
    const isChapterExists = await this.chapterRepository.isChapterExists(chapterId);
    if (!isChapterExists) {
      throw new ChapterNotFoundError();
    }

    return await this.chapterRepository.updateChapter(chapterId, { description });
  }
}
