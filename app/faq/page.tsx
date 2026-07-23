import { FaqAccordion } from "@/components/FaqAccordion";

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <div className="mb-14 flex flex-col items-center gap-3 text-center sm:mb-20">
        <span className="eyebrow text-pastel-pink font-semibold">Good to Know</span>
        <h1 className="text-display-lg font-medium text-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/60">
          Everything you need to know about pre-orders, sizing, and shipping.
        </p>
        <div className="rule-olive mt-6 w-16" />
      </div>

      <FaqAccordion />
    </main>
  );
}
