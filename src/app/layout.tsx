import type { Metadata } from "next";
import { DM_Serif_Display, Playfair_Display, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/walletContext";

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MateOS — Zero Human Factory",
  description:
    "An autonomous AI workforce that runs your business end-to-end. 7 agents. Zero employees. Live now.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://mateos.ar/",
    title: "Empleados de IA para tu Empresa | MateOS",
    description:
      "Agentes de IA personalizados que trabajan 24/7 por tu empresa. Automatizá ventas, atención al cliente y operaciones. 100% a medida para empresas argentinas.",
    locale: "es_AR",
    siteName: "MateOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Empleados de IA para tu Empresa | MateOS",
    description:
      "Agentes de IA personalizados que trabajan 24/7. Para empresas argentinas.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" style={{ background: "#08080F" }}>
      <body
        className={`${dmSerif.variable} ${playfair.variable} ${sourceSans.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ background: "#08080F" }}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
