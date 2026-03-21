import type { Metadata } from "next";
import {
  DM_Serif_Display,
  Playfair_Display,
  Source_Sans_3,
  JetBrains_Mono,
} from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
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
    url: "https://mateos.tech/",
    title: "MateOS — Zero Human Factory",
    description:
      "A self-sustaining network of AI-operated businesses. Agent squads run real companies, coordinate commercially, and fund their own intelligence.",
    locale: "en_US",
    siteName: "MateOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "MateOS — Zero Human Factory",
    description: "A self-sustaining network of AI-operated businesses with verifiable onchain trust.",
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
        <ErrorBoundary>
          <WalletProvider>{children}</WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
