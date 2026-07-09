"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { SearchDrawer } from "./SearchDrawer";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Craftsmanship", href: "/craftsmanship" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mist bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`block h-px w-5 bg-charcoal transition-transform duration-300 ${
              isMenuOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-charcoal transition-transform duration-300 ${
              isMenuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>

        {/* Logo — always centered feel on mobile, left on desktop */}
        <Link
          href="/"
          className="flex items-center gap-2 md:mr-auto"
          aria-label="Licario home"
        >
          <Image
            src="/logo.png"
            alt="Licario"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            priority
          />
          <span className="font-display text-xl tracking-[0.06em] text-black">
            LICARIO
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-10 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-xs uppercase tracking-luxe text-charcoal/70 transition-colors duration-200 hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right utilities */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open search"
            className="ml-6 hidden text-charcoal/70 transition-colors duration-200 hover:text-charcoal sm:inline-flex"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <Link
            href="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative font-body text-xs uppercase tracking-luxe text-charcoal transition-colors duration-200 hover:text-navy"
          >
            Cart
            {itemCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center bg-olive px-1 text-[10px] leading-none text-cream">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <nav
          aria-label="Mobile primary"
          className="flex flex-col gap-1 border-t border-mist bg-cream px-5 py-4 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="py-2.5 font-body text-sm uppercase tracking-wide text-charcoal/80 transition-colors duration-200 hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex items-center gap-2 py-2.5 font-body text-sm uppercase tracking-wide text-charcoal/80 transition-colors duration-200 hover:text-charcoal"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
            Search
          </button>
        </nav>
      )}

      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
