// src/types/product.ts
// import { ObjectId } from 'mongodb'; // Use this if you pass ObjectId to frontend

export interface Product {
  _id: string; // Using string after converting from ObjectId in API
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  imageUrl: string;
  type: string;
  tags: string[];
  status: string;
  createdAt: string | Date; // API might send string, Date on server
  updatedAt: string | Date; // API might send string, Date on server
  format?: string;
  pageCount?: number;
  // downloadUrl is intentionally excluded
}
