"use client";

export function NewsletterForm() {
  return (
    <form
      className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        required
        placeholder="Your email address"
        className="hairline h-12 flex-1 bg-white px-4 font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
      />
      <button
        type="submit"
        className="h-12 shrink-0 bg-charcoal px-6 font-body text-xs uppercase tracking-wide text-cream transition-colors duration-300 ease-luxe hover:bg-navy"
      >
        Subscribe
      </button>
    </form>
  );
}
