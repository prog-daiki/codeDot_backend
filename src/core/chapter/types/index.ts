export type Chapter = {
  id: string;
  title: string;
  description: string | null;
  publishFlag: boolean | null;
  createDate: Date;
  updateDate: Date;
  videoUrl: string | null;
  position: number;
  courseId: string | null;
};
