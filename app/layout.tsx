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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  "name": "Yadav Cricket Academy & Pace Foundation (YCA PACE)",
  "description": "Cricket coaching for girls and boys from age 4 on Hingna Road, Nagpur. Turf and cemented pitches, night floodlight sessions and Pace Foundation video skill analysis.",
  "telephone": "+917709705181",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Mahajanwadi, behind Dahi Handi Ground (Bhagiratha Park), Hingna Road",
    "addressLocality": "Nagpur",
    "addressRegion": "Maharashtra",
    "postalCode": "440016",
    "addressCountry": "IN"
  },
  "coach": {
    "@type": "Person",
    "name": "Jay Singh Yadav",
    "jobTitle": "Head Coach & Founder"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "06:30",
      "closes": "21:30"
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
