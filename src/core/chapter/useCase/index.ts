import Mux from "@mux/mux-node";
import { ChapterNotFoundError } from "../../../error/ChapterNotFoundError";
import { CourseNotFoundError } from "../../../error/CourseNotFoundError";
import { CourseRepository } from "../../course/repository";
import { ChapterRepository } from "../repository";
import type { Chapter } from "../types";
import { MuxDataRepository } from "../../muxData/repository";
import { MuxDataNotFoundError } from "../../../error/MuxDataNotFoundError";
import { ChapterRequiredFieldsEmptyError } from "../../../error/ChapterRequiredFieldsEmptyError";
import type { ChapterWithMuxData } from "../types/ChapterWithMuxData";

/**
 * チャプターに関するユースケースを管理するクラス
 */
export class ChapterUseCase {
  private chapterRepository: ChapterRepository;
  private courseRepository: CourseRepository;
  private muxDataRepository: MuxDataRepository;

  constructor() {
    this.chapterRepository = new ChapterRepository();
    this.courseRepository = new CourseRepository();
    this.muxDataRepository = new MuxDataRepository();
  }

  /**
   * チャプター一覧を取得する
   * @param courseId 講座ID
   * @returns チャプター一覧
   */
  async getChapters(courseId: string): Promise<Chapter[]> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
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
  async getChapter(courseId: string, chapterId: string): Promise<ChapterWithMuxData> {
    // 講座の存在チェック
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    // チャプターの存在チェック
    const isChapterExists: boolean = await this.chapterRepository.isChapterExists(chapterId);
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
    const isCourseExists: boolean = await this.courseRepository.isCourseExists(courseId);
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

  /**
   * チャプターの動画を更新する
   * @param courseId 講座ID
   * @param chapterId チャプターID
   * @param videoUrl チャプター動画URL
   * @returns 更新したチャプター
   */
  async updateChapterVideo(
    courseId: string,
    chapterId: string,
    videoUrl: string,
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

    const { video } = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });

    // MuxDataの存在チェック
    const existsMuxData = await this.muxDataRepository.checkMuxDataExists(chapterId);
    if (existsMuxData) {
      await video.assets.delete(existsMuxData.assetId);
      await this.muxDataRepository.deleteMuxData(chapterId);
    }

    // MuxDataを登録する
    const asset = await video.assets.create({
      input: videoUrl as any,
      playback_policy: ["public"],
      test: false,
    });
    await this.muxDataRepository.registerMuxData(chapterId, asset.id, asset.playback_ids![0].id);

    return await this.chapterRepository.updateChapter(chapterId, { videoUrl });
  }

  /**
   * 講座のチャプターを並び替える
   * @param courseId 講座ID
   * @param list チャプターリスト
   */
  async reorderChapters(courseId: string, list: { id: string; position: number }[]) {
    // 講座の存在チェック
    const isCourseExists = await this.courseRepository.isCourseExists(courseId);
    if (!isCourseExists) {
      throw new CourseNotFoundError();
    }

    await Promise.all(
      list.map(async (chapter) => {
        await this.chapterRepository.updateChapter(chapter.id, {
          position: chapter.position,
        });
      }),
    );
  }

  /**
   * 講座のチャプターを削除する
   * @param courseId
   * @param chapterId
   */
  async deleteChapter(courseId: string, chapterId: string) {
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

    const { video } = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });

    // MuxDataの存在チェック
    const existsMuxData = await this.muxDataRepository.checkMuxDataExists(chapterId);
    if (existsMuxData) {
      await video.assets.delete(existsMuxData.assetId);
      await this.muxDataRepository.deleteMuxData(chapterId);
    }
    const chapter = await this.chapterRepository.deleteChapter(chapterId);

    // 講座のチャプターが0件になった場合、講座を非公開にする
    const chapters = await this.chapterRepository.getPublishChapters(courseId);
    if (chapters.length === 0) {
      await this.courseRepository.updateCourse(courseId, {
        publishFlag: false,
      });
    }
    return chapter;
  }

  /**
   * 講座のチャプターを非公開にする
   * @param courseId 講座ID
   * @param chapterId チャプターID
   */
  async unpublishChapter(courseId: string, chapterId: string) {
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

    const chapter = await this.chapterRepository.updateChapter(chapterId, {
      publishFlag: false,
    });

    // 講座のチャプターが0件になった場合、講座を非公開にする
    const chapters = await this.chapterRepository.getPublishChapters(courseId);
    if (chapters.length === 0) {
      await this.courseRepository.updateCourse(courseId, {
        publishFlag: false,
      });
    }
    return chapter;
  }

  /**
   * 講座のチャプターを公開する
   * @param courseId 講座ID
   * @param chapterId チャプターID
   */
  async publishChapter(courseId: string, chapterId: string) {
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

    // MuxDataの存在チェック
    const existsMuxData = await this.muxDataRepository.checkMuxDataExists(chapterId);
    if (!existsMuxData) {
      throw new MuxDataNotFoundError();
    }

    // チャプターの必須フィールドが空かどうかを確認
    const data = await this.chapterRepository.getChapterById(chapterId);
    if (!data.chapter.title || !data.chapter.description || !data.chapter.videoUrl) {
      throw new ChapterRequiredFieldsEmptyError();
    }

    return await this.chapterRepository.updateChapter(chapterId, {
      publishFlag: true,
    });
  }
}
