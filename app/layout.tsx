import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trackerbee 🐝 - Conversion Analytics",
  description: "Buzz through your conversion problems. See why visitors don't convert and what to fix.",
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
