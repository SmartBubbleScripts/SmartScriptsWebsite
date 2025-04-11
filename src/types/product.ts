export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  imageUrl: string;
  type: string;
  tags: string[];
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  format?: string;
  pageCount?: number;
}
