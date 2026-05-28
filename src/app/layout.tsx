import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Agenda·Pro — agenda editorial con motor de recordatorios",
  description:
    "Una agenda con carácter. Calendario, recordatorios automáticos por correo y un motor que evalúa cada 5 minutos.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${geist.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-screen bg-ink-0 text-bone-0">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
