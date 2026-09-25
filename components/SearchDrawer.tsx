"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

const EASE_LUXE = [0.22, 1, 0.36, 1] as const;

const POPULAR_SEARCHES = [
  "Blazer",
  "Linen Dress",
  "Wool Trousers",
  "Overcoat",
  "Cashmere",
];

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });

  // Only portal to document.body once mounted on the client — avoids SSR mismatch.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Portal mounted status is checked via mounted ref below

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const pushRecent = (q: string) => {
    const normalized = q.trim();
    if (!normalized) return;
    const n = [normalized, ...recent.filter((x) => x !== normalized)].slice(0, 5);
    try {
      localStorage.setItem("recentSearches", JSON.stringify(n));
    } catch {
      // Ignore localStorage errors (private mode, etc.)
    }
    setRecent(n);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark blurred overlay — portaled to <body> so it covers the entire
              viewport instead of being trapped inside the Navbar's backdrop-blur
              containing block. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_LUXE }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />


          {/* Slide-in drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE_LUXE }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col bg-cream rounded-l-3xl shadow-2xl border-l border-mist/30 px-6 py-8 sm:w-[420px] sm:px-10"
          >

            <div className="flex items-center justify-between">
              <span className="eyebrow text-charcoal/60">Search</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="text-charcoal/70 transition-colors duration-200 hover:text-pastel-pink"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Recent Searches section */}
            {recent.length > 0 && (
              <div className="mb-6">
                <span className="font-body text-[10px] uppercase tracking-widest text-charcoal/50">
                  Riwayat Pencarian
                </span>
                <ul className="flex flex-col gap-2 text-xs">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => {
                          pushRecent(term);
                          onClose();
                          router.push(`/shop?search=${encodeURIComponent(term.trim())}`);
                        }}
                        className="flex items-center gap-2 rounded-full border border-mist/30 bg-cream px-2.5 py-1.5 font-body text-charcoal/60 hover:bg-mist/50 hover:text-charcoal transition-all duration-200"
                      >
                        <Search className="h-3 w-3 text-charcoal/40" strokeWidth={1} />
                        {term}
                        <span className="ml-auto text-charcoal/30 opacity-50">·</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("recentSearches");
                        setRecent([]);
                      }}
                      className="flex items-center gap-2 rounded-full border border-mist/30 bg-cream px-2.5 py-1.5 font-body text-[9px] text-charcoal/40 hover:bg-mist/50 hover:text-charcoal transition-all duration-200"
                    >
                      <svg
                        className="h-3 w-3 text-charcoal/40"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hapus semua
                    </button>
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-8 flex items-center gap-3 border-b-2 border-pastel-peach/40 pb-3 transition-colors focus-within:border-pastel-pink">
              <Search className="h-4 w-4 text-charcoal/50" strokeWidth={1.5} />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    pushRecent(query.trim());
                    onClose();
                    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
                  }
                }}
                placeholder="Search products..."
                className="w-full bg-transparent font-body text-base text-charcoal placeholder:text-charcoal/40 focus:outline-none"
              />
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <span className="font-body text-[11px] uppercase tracking-luxe text-charcoal/50">
                Popular Searches
              </span>
              <ul className="flex flex-col gap-3">
                {POPULAR_SEARCHES.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => {
                        pushRecent(term);
                        onClose();
                        router.push(`/shop?search=${encodeURIComponent(term)}`);
                      }}
                      className="font-body text-sm text-charcoal/80 transition-all duration-200 hover:text-pastel-pink hover:translate-x-1"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}