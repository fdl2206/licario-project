export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

/** Every size the atelier can make. Displayed in a consistent order everywhere. */
export const ALL_PRODUCT_SIZES: ProductSize[] = ["S", "M", "L", "XL", "XXL"];

/**
 * `sizes` on a product only lists the sizes that are physically in stock.
 * Any other size is still orderable, but it is made to order — i.e. pre-order.
 */
export function isPreorderSize(
  availableSizes: string[] | null | undefined,
  size: ProductSize
): boolean {
  return !availableSizes?.includes(size);
}

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
  imageGallery?: string[] | null;
  color?: string;
  material?: string;
  details?: string;
  care_instructions?: string;
  is_sold_out?: boolean;
  is_preorder?: boolean;
}
