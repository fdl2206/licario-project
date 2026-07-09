import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { dummyProducts } from "@/lib/dummyProducts";


export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative flex min-h-[88vh] w-full items-center justify-center overflow-hidden bg-navy">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/licario-hero/1800/1200')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <span className="eyebrow text-cream/80">Indonesian Premium Apparel</span>
          <h1 className="max-w-3xl text-display-lg text-cream md:text-display-2xl">
            Simply Distinct
          </h1>
          <p className="max-w-xl font-body text-sm leading-relaxed text-cream/80 md:text-base">
            Luxury expressed through restraint — considered silhouettes,
            honest materials, and craftsmanship built to outlast trends.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-12 items-center justify-center border border-cream px-8 font-body text-xs uppercase tracking-wide text-cream transition-colors duration-300 ease-luxe hover:bg-cream hover:text-navy"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* ============================================================
          BRAND STATEMENT
          ============================================================ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20 text-center sm:py-28">
        <span className="eyebrow text-charcoal/60">Our Philosophy</span>
        <h2 className="mt-4 text-display-md text-charcoal md:text-display-lg">
          Luxury in simplicity, integrity, and craftsmanship.
        </h2>
        <div className="rule-olive mx-auto mt-8 w-16" />
        <p className="mx-auto mt-8 max-w-xl font-body text-sm leading-relaxed text-charcoal/70">
          Every Licario piece is designed to be worn for years, not seasons —
          a quiet rebellion against excess, built from fabrics and forms
          that speak for themselves.
        </p>
      </section>

      {/* ============================================================
          PRODUCT GRID
          ============================================================ */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
        <div className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-14">
          <span className="eyebrow text-charcoal/60">New Arrivals</span>
          <h2 className="text-display-md text-charcoal">Featured Pieces</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {dummyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center border border-charcoal px-8 font-body text-xs uppercase tracking-wide text-charcoal transition-colors duration-300 ease-luxe hover:bg-charcoal hover:text-cream"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* ============================================================
          CRAFTSMANSHIP STRIP
          ============================================================ */}
      <section className="w-full bg-charcoal py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 sm:grid-cols-3 sm:px-8">
          {[
            {
              title: "Considered Materials",
              copy: "Natural fibers sourced for longevity — linen, wool, silk, and cashmere selected by hand.",
            },
            {
              title: "Local Craftsmanship",
              copy: "Every piece is cut and sewn by Indonesian ateliers with decades of tailoring expertise.",
            },
            {
              title: "Built to Last",
              copy: "Timeless silhouettes designed to remain relevant well beyond a single season.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3 text-center">
              <span className="text-2xl text-olive">—</span>
              <h3 className="font-display text-lg text-cream">{item.title}</h3>
              <p className="font-body text-sm leading-relaxed text-cream/60">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          NEWSLETTER / CLOSING CTA
          ============================================================ */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-28">
        <span className="eyebrow text-charcoal/60">Stay Connected</span>
        <h2 className="text-display-md text-charcoal">
          Join the Licario Circle
        </h2>
        <p className="max-w-md font-body text-sm leading-relaxed text-charcoal/70">
          Be first to know about new collections, limited releases, and
          private previews.
        </p>
        <NewsletterForm />

      </section>
    </main>
  );
}
