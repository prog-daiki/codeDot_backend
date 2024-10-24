import type { Course } from ".";
import type { Category } from "../../category/types";
import type { Chapter } from "../../chapter/types";

export type PurchaseCourse = {
  course: Course;
  category: Category | null;
  chapters: Chapter[];
};
