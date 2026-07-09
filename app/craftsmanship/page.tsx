export default function CraftsmanshipPage() {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-charcoal">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/licario-craft-hero/1800/1100')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <span className="eyebrow text-cream/80">Our Process</span>
          <h1 className="max-w-2xl text-display-lg text-cream md:text-display-xl">
            Considered Materials
          </h1>
        </div>
      </section>

      {/* Story block 1 — image left, text right */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-24 sm:py-28 md:grid-cols-2 md:items-center">
        <div
          className="w-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://picsum.photos/seed/licario-craft-1/900/1100')",
            aspectRatio: "3 / 4",
          }}
        />
        <div className="flex flex-col gap-5">
          <span className="eyebrow text-charcoal/60">Chapter One</span>
          <h2 className="text-display-md text-charcoal md:text-display-lg">
            Fabric Selected by Hand
          </h2>
          <div className="rule-olive w-16" />
          <p className="font-body text-sm leading-relaxed text-charcoal/70">
            Every bolt of linen, wool, silk, and cashmere passes through our
            hands before it ever reaches an atelier table. We reject anything
            that compromises on drape, breathability, or longevity —
            prioritizing natural fibers sourced from mills with decades of
            expertise in their craft.
          </p>
          <p className="font-body text-sm leading-relaxed text-charcoal/70">
            This isn&apos;t about chasing trends in textile innovation. It&apos;s
            about choosing materials that soften with wear, hold their shape
            season after season, and quietly outlast whatever is fashionable
            this year.
          </p>
        </div>
      </section>

      {/* Story block 2 — text left, image right */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-24 sm:py-28 md:grid-cols-2 md:items-center">
        <div className="order-2 flex flex-col gap-5 md:order-1">
          <span className="eyebrow text-charcoal/60">Chapter Two</span>
          <h2 className="text-display-md text-charcoal md:text-display-lg">
            Cut and Sewn in Indonesia
          </h2>
          <div className="rule-olive w-16" />
          <p className="font-body text-sm leading-relaxed text-charcoal/70">
            Each Licario garment is constructed in small Indonesian ateliers
            by tailors whose expertise spans generations. We work in limited
            runs — never mass production — so every seam receives the
            attention it deserves.
          </p>
          <p className="font-body text-sm leading-relaxed text-charcoal/70">
            It is slower. It is more deliberate. And it is the only way we
            know how to build clothing meant to be lived in, not simply worn
            once and forgotten.
          </p>
        </div>
        <div
          className="order-1 w-full bg-cover bg-center md:order-2"
          style={{
            backgroundImage: "url('https://picsum.photos/seed/licario-craft-2/900/1100')",
            aspectRatio: "3 / 4",
          }}
        />
      </section>

      {/* Closing statement */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-28">
        <span className="text-2xl text-olive">—</span>
        <h2 className="text-display-md text-charcoal">
          Built to Be Worn for Years, Not Seasons
        </h2>
        <p className="max-w-lg font-body text-sm leading-relaxed text-charcoal/70">
          This is the quiet promise behind every Licario piece — simplicity,
          integrity, and craftsmanship, expressed through restraint.
        </p>
      </section>
    </main>
  );
}
