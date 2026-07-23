export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface ProductVariant {
  id: string;
  size: ProductSize;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductCardData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: ProductImage[];
  sizes: string[];
  variants: ProductVariant[];
}
