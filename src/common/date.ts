/**
 * 現在の日本標準時（JST）の Date オブジェクトを返します。
 *
 * @returns {Date} 日本標準時の Date オブジェクト
 */
export function getCurrentJstDate(): Date {
  const UTC_TO_JST_OFFSET_HOURS = 9;
  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

  try {
    const utcDate = new Date();
    return new Date(utcDate.getTime() + UTC_TO_JST_OFFSET_HOURS * MILLISECONDS_PER_HOUR);
  } catch (error) {
    console.error("日本標準時の取得に失敗しました:", error);
    throw new Error("日本標準時の取得に失敗しました");
  }
}
