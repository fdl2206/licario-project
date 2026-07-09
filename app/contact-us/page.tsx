import Link from "next/link";
import { MessageCircle, AtSign, Send, Globe } from "lucide-react";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: AtSign },
  { label: "Facebook", href: "https://facebook.com", icon: Globe },
  { label: "Twitter", href: "https://twitter.com", icon: Send },
];


export default function ContactUsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <div className="mb-14 flex flex-col items-center gap-3 text-center">
        <span className="eyebrow text-charcoal/60">We&apos;re Here to Help</span>
        <h1 className="text-display-lg text-charcoal">Contact Us</h1>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/70">
          Reach out for styling advice, order inquiries, or anything else —
          our team responds with the same care we put into every garment.
        </p>
      </div>

      {/* Admin WhatsApp box */}
      <div className="hairline flex flex-col items-center gap-4 bg-white px-8 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center bg-cream">
          <MessageCircle className="h-6 w-6 text-olive" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-xl text-charcoal">
          Chat with Our Admin
        </h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/70">
          For fastest response on orders, sizing, and pre-orders, message us
          directly on WhatsApp.
        </p>
        <Link
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex h-12 items-center justify-center bg-charcoal px-8 font-body text-xs uppercase tracking-wide text-cream transition-colors duration-300 ease-luxe hover:bg-navy"
        >
          Message on WhatsApp
        </Link>
      </div>

      {/* Social media box */}
      <div className="hairline mt-8 flex flex-col items-center gap-6 bg-white px-8 py-12 text-center">
        <h2 className="font-display text-xl text-charcoal">Follow Licario</h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/70">
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
              className="flex h-11 w-11 items-center justify-center border border-charcoal/20 text-charcoal/70 transition-colors duration-200 hover:border-charcoal hover:text-charcoal"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
