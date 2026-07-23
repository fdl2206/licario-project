const LOOKBOOK_IMAGES = [
  {
    src: "https://picsum.photos/seed/licario-look-1/900/1200",
    caption: "The Editorial — Look 01",
    span: "md:col-span-7",
  },
  {
    src: "https://picsum.photos/seed/licario-look-2/900/700",
    caption: "Studio Detail",
    span: "md:col-span-5",
  },
  {
    src: "https://picsum.photos/seed/licario-look-3/900/1300",
    caption: "The Editorial — Look 02",
    span: "md:col-span-5",
  },
  {
    src: "https://picsum.photos/seed/licario-look-4/900/900",
    caption: "Texture Study",
    span: "md:col-span-7",
  },
  {
    src: "https://picsum.photos/seed/licario-look-5/900/1200",
    caption: "The Editorial — Look 03",
    span: "md:col-span-6",
  },
  {
    src: "https://picsum.photos/seed/licario-look-6/900/1200",
    caption: "The Editorial — Look 04",
    span: "md:col-span-6",
  },
];

export default function CollectionsPage() {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mb-20 flex flex-col items-center gap-4 text-center sm:mb-28">
          <span className="eyebrow text-pastel-pink font-semibold">Season II</span>
          <h1 className="text-display-lg font-medium text-charcoal md:text-display-xl">
            The Quiet Hour
          </h1>
          <p className="mt-4 max-w-lg font-body text-sm leading-relaxed text-charcoal/60">
            A collection built around stillness — considered tailoring,
            honest fabrics, and the kind of restraint that ages well.
          </p>
          <div className="rule-olive mt-6 w-16" />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-12">
          {LOOKBOOK_IMAGES.map((image, index) => (
            <figure
              key={image.caption}
              className={`flex flex-col gap-5 ${image.span} ${
                index % 2 === 1 ? "md:mt-24" : ""
              }`}
            >
              <div
                className="w-full rounded-2xl shadow-card bg-cover bg-center overflow-hidden border border-mist/20"
                style={{
                  backgroundImage: `url('${image.src}')`,
                  aspectRatio: "3 / 4",
                }}
              />
              <figcaption className="font-body text-[10px] uppercase tracking-luxe text-charcoal/40 px-2">
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-32 flex flex-col items-center gap-4 text-center">
          <span className="text-2xl text-pastel-pink font-semibold">—</span>
          <p className="max-w-md font-body text-sm leading-relaxed text-charcoal/60">
            Full collection available in-store and by private appointment.
          </p>
        </div>
      </div>
    </main>
  );
}
