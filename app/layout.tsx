import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catlicks - Conversion Analytics",
  description: "See why visitors don't convert and what to fix. Conversion-focused analytics for marketers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
