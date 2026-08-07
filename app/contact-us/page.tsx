import Link from "next/link";
import { MessageCircle, AtSign, Send, Globe } from "lucide-react";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/licario.id/", icon: AtSign },
  { label: "Facebook", href: "https://facebook.com", icon: Globe },
  { label: "Twitter", href: "https://twitter.com", icon: Send },
];


export default function ContactUsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <div className="mb-14 flex flex-col items-center gap-3 text-center sm:mb-20">
        <span className="eyebrow text-pastel-pink font-semibold">We're Here to Help</span>
        <h1 className="text-display-lg font-medium text-charcoal">Contact Us</h1>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/60">
          Reach out for styling advice, order inquiries, or anything else —
          our team responds with the same care we put into every garment.
        </p>
        <div className="rule-olive mt-6 w-16" />
      </div>

      {/* Admin WhatsApp box */}
      <div className="rounded-3xl border border-mist/30 bg-white shadow-card flex flex-col items-center gap-5 px-8 py-12 text-center transition-all hover:shadow-card-hover">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-blue shadow-inner">
          <MessageCircle className="h-7 w-7 text-pastel-pink" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-2xl font-medium text-charcoal">
          Chat with Our Admin
        </h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          For fastest response on orders, sizing, and pre-orders, message us
          directly on WhatsApp.
        </p>
        <Link
          href="https://wa.me/6281231740217"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-pastel-peach px-10 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
        >
          Message on WhatsApp
        </Link>
      </div>

      {/* Social media box */}
      <div className="rounded-3xl border border-mist/30 bg-white/60 shadow-card mt-10 flex flex-col items-center gap-6 px-8 py-12 text-center transition-all hover:shadow-card-hover">
        <h2 className="font-display text-2xl font-medium text-charcoal">Follow Licario</h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          Stay close to new collections, behind-the-scenes craftsmanship, and
          styling inspiration.
        </p>
        <div className="flex items-center gap-6">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-mist bg-white text-charcoal/60 shadow-sm transition-all duration-300 hover:border-pastel-pink hover:bg-pastel-pink hover:text-white hover:scale-110"
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
