import Link from "next/link";
import Image from "next/image";

const FOOTER_COLUMNS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Explore",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "New Arrivals", href: "/shop" },
      { label: "Best Sellers", href: "/shop" },
    ],
  },
  {
    title: "Client Services",
    links: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "The House of Licario",
    links: [
      { label: "About", href: "/about" },
      { label: "Craftsmanship", href: "/craftsmanship" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-pastel-blue border-t border-mist/30 text-charcoal/80">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
        {/* Brand + tagline */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-16">
          <span className="font-display text-2xl tracking-[0.06em] text-black">
            LICARIO
          </span>
          <p className="max-w-xs font-body text-xs uppercase tracking-luxe text-charcoal/50">
            Simply Distinct
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3 className="font-body text-[11px] uppercase tracking-luxe text-charcoal/50">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-charcoal/80 transition-colors duration-200 hover:text-charcoal hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-charcoal/10 sm:my-16" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="font-body text-xs text-charcoal/50">
            © {new Date().getFullYear()} Licario. All rights reserved.
          </p>
          <p className="font-body text-xs text-charcoal/50">
            Crafted in Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
