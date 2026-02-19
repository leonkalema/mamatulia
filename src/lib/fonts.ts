import { DM_Sans, Libre_Baskerville } from "next/font/google";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "700"],
});
