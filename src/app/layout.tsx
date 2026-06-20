import type { Metadata } from "next";
import { EB_Garamond, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "In Loving Memory of Dr. (Mrs.) Uwem Oyekan",
  description:
    "Register for the remembrance ceremony of Dr. (Mrs.) Uwem Oyekan. July 4th, 2026 at 11AM, Amen Event Center, Abesan Estate Gate, Ipaja, Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-serif">
        {children}
      </body>
    </html>
  );
}
