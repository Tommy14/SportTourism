import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitch to Paradise",
  description: "Curated cricket travel packages with matches, camps and sightseeing in Sri Lanka.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
