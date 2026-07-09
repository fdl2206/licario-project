import { ProductCard } from "@/components/ProductCard";
import { dummyProducts } from "@/lib/dummyProducts";

export default function ShopPage() {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-12 flex flex-col items-center gap-2 text-center sm:mb-16">
          <span className="eyebrow text-charcoal/60">The Full Catalogue</span>
          <h1 className="text-display-lg text-charcoal">Shop All</h1>
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/70">
            Every Licario piece, in one place — considered silhouettes built
            to be worn for years, not seasons.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {dummyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
