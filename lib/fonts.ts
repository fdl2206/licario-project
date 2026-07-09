import { Bodoni_Moda, Montserrat } from "next/font/google";

// Display face — headers, hero titles, product names, prices on PDP.
// Used with restraint: never for body copy or UI labels.
export const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

// Body face — nav, buttons, descriptions, form fields, all UI chrome.
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});
