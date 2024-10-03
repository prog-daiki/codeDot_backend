import type { Chapter } from ".";
import type { MuxData } from "../../muxData/types";

export type ChapterWithMuxData = {
  chapter: Chapter;
  mux_data: MuxData | null;
};
