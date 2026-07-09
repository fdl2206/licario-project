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
        <div className="mb-20 flex flex-col items-center gap-3 text-center">
          <span className="eyebrow text-charcoal/60">Season II</span>
          <h1 className="text-display-lg text-charcoal md:text-display-xl">
            The Quiet Hour
          </h1>
          <p className="mt-4 max-w-lg font-body text-sm leading-relaxed text-charcoal/70">
            A collection built around stillness — considered tailoring,
            honest fabrics, and the kind of restraint that ages well.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-12">
          {LOOKBOOK_IMAGES.map((image, index) => (
            <figure
              key={image.caption}
              className={`flex flex-col gap-4 ${image.span} ${
                index % 2 === 1 ? "md:mt-16" : ""
              }`}
            >
              <div
                className="w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${image.src}')`,
                  aspectRatio: "3 / 4",
                }}
              />
              <figcaption className="font-body text-xs uppercase tracking-luxe text-charcoal/50">
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-24 flex flex-col items-center gap-3 text-center">
          <span className="text-2xl text-olive">—</span>
          <p className="max-w-md font-body text-sm leading-relaxed text-charcoal/60">
            Full collection available in-store and by private appointment.
          </p>
        </div>
      </div>
    </main>
  );
}
