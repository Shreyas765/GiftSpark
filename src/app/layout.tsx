// app/layout.tsx
import Providers from "./providers";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GiftSpark - Find the Perfect Gift",
  description: "Discover personalized gift recommendations for anyone in your life",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
