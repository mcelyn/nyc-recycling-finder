import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NYC Special Waste & Recycling Finder",
  description:
    "Find drop-off stations and safe disposal guidelines for items that cannot go in NYC curbside bins: electronics, batteries, paint, nail polish, and hazardous household waste.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
