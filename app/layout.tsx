import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BELLS DARK WEB",
  description: "Anonymous media. No names. No identities.",
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