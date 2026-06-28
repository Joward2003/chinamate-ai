import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChinaMate AI — Travel China with confidence",
  description:
    "An AI travel companion that turns a China trip into clear, executable next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
