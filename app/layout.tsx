import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
});
const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "YCA PACE | Yadav Cricket Academy & Pace Foundation, Nagpur",
  description:
    "Cricket coaching for girls and boys from age 4 on Hingna Road, Nagpur. Turf and cemented pitches, night sessions and video skill analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
