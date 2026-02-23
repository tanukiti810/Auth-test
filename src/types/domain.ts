// src/types/domain.ts
export type User = { id: string; email: string; createdAt?: string };

export type ProductType = "image" | "music" | "video" | "fonts";

export type Product = {
  id: string;
  type: ProductType;
  title: string;
  price: number;
  tags: string[];
  previewUrl: string;
  description: string;
  createdAt: string;
};

export type Purchase = {
  id: string;
  productId: string;
  userId: string;
  purchasedAt: string;
};
