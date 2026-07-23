"use client";

export function NewsletterForm() {
  return (
    <form
      className="mt-4 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        required
        placeholder="Your email address"
        className="hairline h-12 flex-1 rounded-xl bg-white px-5 font-body text-sm text-charcoal placeholder:text-charcoal/40 shadow-sm focus:ring-2 focus:ring-pastel-peach/50 focus:outline-none transition-all"
      />
      <button
        type="submit"
        className="h-12 shrink-0 rounded-xl bg-pastel-peach px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
      >
        Subscribe
      </button>
    </form>
  );
}
