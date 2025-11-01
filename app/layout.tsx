import type { Metadata } from "next";
import Script from "next/script";
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
      <body>
        {children}
        
        {/* Trackerbee Analytics - Dogfooding our own product! 🐝 */}
        <Script 
          src="https://web-analytics-flax.vercel.app/track.js?id=82c08676-46d2-4c60-aa70-7256e80e7a28"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
