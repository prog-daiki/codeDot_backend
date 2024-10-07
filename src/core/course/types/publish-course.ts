import type { Course } from ".";
import type { Category } from "../../category/types";
import type { Chapter } from "../../chapter/types";

export type PublishCourse = {
  course: Course;
  category: Category | null;
  chapters: Chapter[];
  purchased: boolean;
};
