import type { Course } from ".";
import type { Category } from "../../category/types";
import type { Chapter } from "../../chapter/types";
import type { MuxData } from "../../muxData/types";

export type PublishCourseWithMuxData = {
  course: Course;
  category: Category | null;
  chapters: (Chapter & { muxData: MuxData | null })[];
  purchased: boolean;
};
