import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-pastel-pink font-semibold">Under Development</span>
        <h1 className="text-display-md font-medium text-charcoal">Coming Soon</h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          We're currently perfecting this part of the Licario experience.
          Stay tuned for something truly distinct.
        </p>
      </div>
      
      <div className="rule-olive mt-2 w-16" />

      <Link
        href="/"
        className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-pastel-peach px-10 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
      >
        Back to Home
      </Link>
    </main>
  );
}
