import type { Metadata } from "next";
import { DM_Serif_Display, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
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
  title: "Empleados de IA para Empresas Argentinas | Gaucho Solutions",
  description:
    "Empleados digitales con IA para empresas argentinas. Agentes de inteligencia artificial que trabajan 24/7 automatizando ventas, atención y operaciones.",
  openGraph: {
    type: "website",
    url: "https://gauchosolutions.com/",
    title: "Empleados de IA para tu Empresa | Gaucho Solutions",
    description:
      "Agentes de IA personalizados que trabajan 24/7 por tu empresa. Automatizá ventas, atención al cliente y operaciones. 100% a medida para empresas argentinas.",
    locale: "es_AR",
    siteName: "Gaucho Solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Empleados de IA para tu Empresa | Gaucho Solutions",
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
    <html lang="es-AR">
      <body
        className={`${dmSerif.variable} ${sourceSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
