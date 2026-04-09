import type { Metadata } from "next";
import { Oswald, Lato } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lato = Lato({
  variable: "--font-secondary",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Mi App TypeScript",
  description: "Sistema fullstack funcionando correctamente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-900 text-white">{children}</body>
    </html>
  );
}
