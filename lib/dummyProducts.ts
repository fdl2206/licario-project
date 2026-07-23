import type { ProductCardData } from "@/lib/product";

/**
 * Dummy fashion catalogue for landing page development.
 * Updated with relevant Unsplash images to fit the product names.
 */
export const dummyProducts: ProductCardData[] = [
  {
    id: "prod-01",
    name: "Aria Tailored Blazer",
    slug: "aria-tailored-blazer",
    price: 1890000,
    compareAtPrice: 2350000,
    images: [
      { id: "img-01a", url: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Aria Tailored Blazer, front view", sortOrder: 0 },
      { id: "img-01b", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Aria Tailored Blazer, detail view", sortOrder: 1 },
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
      { id: "img-02a", url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Linen Column Dress, front view", sortOrder: 0 },
      { id: "img-02b", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Linen Column Dress, back view", sortOrder: 1 },
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
      { id: "img-03a", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Olive Wool Trousers, front view", sortOrder: 0 },
      { id: "img-03b", url: "https://images.unsplash.com/photo-1624371414361-e6e8ea0c91d2?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Olive Wool Trousers, side view", sortOrder: 1 },
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
      { id: "img-04a", url: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Charcoal Silk Shirt, front view", sortOrder: 0 },
      { id: "img-04b", url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Charcoal Silk Shirt, detail view", sortOrder: 1 },
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
      { id: "img-05a", url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Navy Overcoat, front view", sortOrder: 0 },
      { id: "img-05b", url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Navy Overcoat, back view", sortOrder: 1 },
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
      { id: "img-06a", url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Cream Cashmere Sweater, front view", sortOrder: 0 },
      { id: "img-06b", url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=900&h=1200", altText: "Cream Cashmere Sweater, detail view", sortOrder: 1 },
    ],
    variants: [
      { id: "var-06-s", size: "S", stock: 5 },
      { id: "var-06-m", size: "M", stock: 5 },
      { id: "var-06-l", size: "L", stock: 5 },
      { id: "var-06-xl", size: "XL", stock: 4 },
    ],
  },
];
