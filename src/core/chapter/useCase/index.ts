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
}
