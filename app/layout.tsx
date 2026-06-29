import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "VentureOps Autopilot",
  description: "Agentic Business Control Tower for safe AI-operated micro-businesses.",
  icons: {
    icon: "/icon.svg"
  },
  openGraph: {
    title: "VentureOps Autopilot",
    description: "Launch, earn, spend, fulfill, and audit a micro-business with policy-controlled agents.",
    images: ["/og-image.svg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "VentureOps Autopilot",
    description: "Agentic Business Control Tower for safe AI-operated micro-businesses.",
    images: ["/og-image.svg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
