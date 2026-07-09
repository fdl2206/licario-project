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
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
}
