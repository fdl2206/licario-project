import type { ProductCardData } from "@/lib/product";

/**
 * Dummy fashion catalogue for landing page development.
 * Replace with real product data once the storefront API is wired up.
 */
export const dummyProducts: ProductCardData[] = [
  {
    id: "prod-01",
    name: "Aria Tailored Blazer",
    slug: "aria-tailored-blazer",
    price: 1890000,
    compareAtPrice: 2350000,
    images: [
      { id: "img-01a", url: "https://picsum.photos/seed/licario-blazer-1/900/1200", altText: "Aria Tailored Blazer, front view", sortOrder: 0 },
      { id: "img-01b", url: "https://picsum.photos/seed/licario-blazer-2/900/1200", altText: "Aria Tailored Blazer, detail view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-01-s", size: "S", stock: 4 },
      { id: "var-01-m", size: "M", stock: 6 },
      { id: "var-01-l", size: "L", stock: 2 },
      { id: "var-01-xl", size: "XL", stock: 0 },
    ],
  },
  {
    id: "prod-02",
    name: "Linen Column Dress",
    slug: "linen-column-dress",
    price: 1450000,
    compareAtPrice: null,
    images: [
      { id: "img-02a", url: "https://picsum.photos/seed/licario-dress-1/900/1200", altText: "Linen Column Dress, front view", sortOrder: 0 },
      { id: "img-02b", url: "https://picsum.photos/seed/licario-dress-2/900/1200", altText: "Linen Column Dress, back view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-02-s", size: "S", stock: 3 },
      { id: "var-02-m", size: "M", stock: 5 },
      { id: "var-02-l", size: "L", stock: 5 },
      { id: "var-02-xl", size: "XL", stock: 1 },
    ],
  },
  {
    id: "prod-03",
    name: "Olive Wool Trousers",
    slug: "olive-wool-trousers",
    price: 1120000,
    compareAtPrice: 1350000,
    images: [
      { id: "img-03a", url: "https://picsum.photos/seed/licario-trousers-1/900/1200", altText: "Olive Wool Trousers, front view", sortOrder: 0 },
      { id: "img-03b", url: "https://picsum.photos/seed/licario-trousers-2/900/1200", altText: "Olive Wool Trousers, side view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-03-s", size: "S", stock: 0 },
      { id: "var-03-m", size: "M", stock: 4 },
      { id: "var-03-l", size: "L", stock: 4 },
      { id: "var-03-xl", size: "XL", stock: 2 },
    ],
  },
  {
    id: "prod-04",
    name: "Charcoal Silk Shirt",
    slug: "charcoal-silk-shirt",
    price: 980000,
    compareAtPrice: null,
    images: [
      { id: "img-04a", url: "https://picsum.photos/seed/licario-shirt-1/900/1200", altText: "Charcoal Silk Shirt, front view", sortOrder: 0 },
      { id: "img-04b", url: "https://picsum.photos/seed/licario-shirt-2/900/1200", altText: "Charcoal Silk Shirt, detail view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-04-s", size: "S", stock: 6 },
      { id: "var-04-m", size: "M", stock: 6 },
      { id: "var-04-l", size: "L", stock: 3 },
      { id: "var-04-xl", size: "XL", stock: 3 },
    ],
  },
  {
    id: "prod-05",
    name: "Navy Overcoat",
    slug: "navy-overcoat",
    price: 2650000,
    compareAtPrice: 3100000,
    images: [
      { id: "img-05a", url: "https://picsum.photos/seed/licario-coat-1/900/1200", altText: "Navy Overcoat, front view", sortOrder: 0 },
      { id: "img-05b", url: "https://picsum.photos/seed/licario-coat-2/900/1200", altText: "Navy Overcoat, back view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-05-s", size: "S", stock: 2 },
      { id: "var-05-m", size: "M", stock: 3 },
      { id: "var-05-l", size: "L", stock: 0 },
      { id: "var-05-xl", size: "XL", stock: 1 },
    ],
  },
  {
    id: "prod-06",
    name: "Cream Cashmere Sweater",
    slug: "cream-cashmere-sweater",
    price: 1290000,
    compareAtPrice: null,
    images: [
      { id: "img-06a", url: "https://picsum.photos/seed/licario-sweater-1/900/1200", altText: "Cream Cashmere Sweater, front view", sortOrder: 0 },
      { id: "img-06b", url: "https://picsum.photos/seed/licario-sweater-2/900/1200", altText: "Cream Cashmere Sweater, detail view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-06-s", size: "S", stock: 5 },
      { id: "var-06-m", size: "M", stock: 5 },
      { id: "var-06-l", size: "L", stock: 5 },
      { id: "var-06-xl", size: "XL", stock: 4 },
    ],
  },
];
