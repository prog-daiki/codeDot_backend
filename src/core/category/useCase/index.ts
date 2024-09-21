import { CategoryRepository } from "../repository";
import type { Category } from "../types";

/**
 * カテゴリーに関するユースケースを管理するクラス
 */
export class CategoryUseCase {
  private categoryRepository: CategoryRepository;
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * カテゴリーを取得する
   * @returns カテゴリー一覧
   */
  async getCategories(): Promise<Category[]> {
    return await this.categoryRepository.getCategories();
  }
}
