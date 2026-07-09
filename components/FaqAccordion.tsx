"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How does the pre-order process work?",
    answer:
      "Pre-order pieces are made in limited runs to reduce waste. Once you place a pre-order, your item is cut and sewn by our ateliers, then shipped within the timeframe noted on the product page — typically 2–4 weeks.",
  },
  {
    question: "How do I find my correct size?",
    answer:
      "Each product page includes a detailed size chart with measurements in centimeters. If you're between sizes, we generally recommend sizing up for a more relaxed, considered fit — true to the Licario silhouette.",
  },
  {
    question: "What are the shipping times and costs?",
    answer:
      "Domestic orders within Indonesia typically arrive within 2–5 business days. International shipping times vary by destination. Shipping costs are calculated at checkout based on your delivery address.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Yes — unworn items with tags attached can be returned or exchanged within 14 days of delivery. Pre-order and made-to-order pieces are final sale, as noted on the product page.",
  },
  {
    question: "How should I care for my Licario pieces?",
    answer:
      "Every piece includes care instructions on its label. As a general rule, we recommend gentle hand-washing or dry cleaning for our natural fiber garments to preserve their shape and finish for years to come.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col divide-y divide-mist border-t border-b border-mist">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-6 text-left"
            >
              <span className="font-display text-base text-charcoal sm:text-lg">
                {item.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-charcoal/60 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="max-w-2xl font-body text-sm leading-relaxed text-charcoal/70">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
