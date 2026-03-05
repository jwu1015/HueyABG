import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HuyABG",
  description: "HuyABG — add an AI chatbot when you're ready",
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
