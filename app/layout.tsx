import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "David Perk",
    template: "%s · David Perk",
  },
  description:
    "Trading education and mentorship — book a call or start with the basic course.",
  metadataBase: new URL("https://www.davidperk.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "David Perk",
    title: "David Perk",
    description:
      "Trading education and mentorship — book a call or start with the basic course.",
  },
  twitter: {
    card: "summary_large_image",
    title: "David Perk",
    description:
      "Trading education and mentorship — book a call or start with the basic course.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#010409",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} min-h-screen min-w-0 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
