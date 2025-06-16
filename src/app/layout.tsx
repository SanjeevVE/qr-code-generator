import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create QR",
  description: "Convert your link to QR code",
  icons: {
    icon: '/vercel.svg',
    shortcut: '/vercel.svg',
    apple: '/vercel.svg',
  },
  openGraph: {
    title: 'Create QR',
    description: 'Convert your link to QR code easily',
    images: [
      {
        url: '/qr-logo.png',
        width: 1200,
        height: 630,
        alt: 'QR Code Generator',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create QR',
    description: 'Convert your link to QR code easily',
    images: ['/qr-logo.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/vercel.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}