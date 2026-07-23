import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { bodoniModa, montserrat } from "@/lib/fonts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";



export const metadata: Metadata = {
  title: "LICARIO — Simply Distinct",
  description:
    "Indonesian premium apparel. Luxury in simplicity, integrity, and craftsmanship.",
  // Next.js auto-detects app/icon.png via file convention, but we declare it
  // explicitly here too so the favicon is guaranteed across all environments.
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${montserrat.variable}`}>
      <body>
        <Navbar />
        {children}
        {/* <WhatsAppButton /> — global floating button, all pages */}
        <Toaster
          position="top-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex items-center gap-3 border border-mist bg-white rounded-2xl px-5 py-4 shadow-card font-body text-sm text-charcoal min-w-[320px] transition-all duration-300",
              title: "font-body font-semibold text-sm text-charcoal",
              description: "font-body text-xs text-charcoal/50",
              icon: "text-pastel-pink",
            },
          }}
        />
        <Footer />
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>

  );
}

