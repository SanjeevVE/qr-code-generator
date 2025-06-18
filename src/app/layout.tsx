import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}