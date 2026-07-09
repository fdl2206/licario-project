import { FaqAccordion } from "@/components/FaqAccordion";

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <div className="mb-14 flex flex-col items-center gap-3 text-center">
        <span className="eyebrow text-charcoal/60">Good to Know</span>
        <h1 className="text-display-lg text-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/70">
          Everything you need to know about pre-orders, sizing, and shipping.
        </p>
      </div>

      <FaqAccordion />
    </main>
  );
}
