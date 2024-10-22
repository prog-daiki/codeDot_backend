/**
 * エラーメッセージの定義
 */
export const Messages = {
  MSG_ERR_001: "認証されていません",
  MSG_ERR_002: "管理者権限が必要です",
  MSG_ERR_003: (entity: Entity) => `存在しない${entity}です`,
  MSG_ERR_004: "必須項目が未入力です",
  MSG_ERR_005: "購入済みの講座です",
  MSG_ERR_006: "無料講座ではありません",
};

/**
 * エンティティの種類
 */
export enum Entity {
  COURSE = "講座",
  CATEGORY = "カテゴリー",
  CHAPTER = "チャプター",
  MUXDATA = "Muxデータ",
}
