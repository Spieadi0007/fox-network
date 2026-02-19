import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FoxNetwork — The Operating System for Physical Infrastructure",
  description:
    "Manage your field teams, validate work with AI, and close jobs in minutes. The command center for physical infrastructure operations.",
  openGraph: {
    title: "FoxNetwork — The Operating System for Physical Infrastructure",
    description:
      "Manage your field teams, validate work with AI, and close jobs in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"698ec73ce16e4600199567ab"})},document.head.appendChild(o)}initApollo();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
