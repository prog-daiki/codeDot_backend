export type Course = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  sourceUrl: string | null;
  publishFlag: boolean | null;
  categoryId: string | null;
  createDate: Date;
  updateDate: Date;
};
