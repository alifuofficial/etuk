import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n/useI18n";
import { AuthProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00BFFF",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://etuk.soretiinternational.com"),
  title: {
    default: "ETUK - Electric 3-Wheelers | Soreti International Trading",
    template: "%s | ETUK",
  },
  description: "Ethiopia's premier electric 3-wheeler by Soreti International Trading. Assembled in Modjo, Head Office in Addis Ababa. Join our network of agents across Ethiopia.",
  keywords: ["ETUK", "Electric 3-Wheeler", "Ethiopia", "Soreti", "Electric Vehicle", "Sustainable Transport", "Addis Ababa", "Modjo", "Bajaj Electric"],
  authors: [{ name: "Soreti International Trading" }],
  creator: "Soreti International Trading",
  publisher: "Soreti International Trading",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://etuk.soretiinternational.com",
    siteName: "ETUK - Electric 3-Wheelers",
    title: "ETUK - Electric 3-Wheelers | Soreti International Trading",
    description: "Power Your Journey with ETUK - Ethiopia's Premier Electric 3-Wheeler. Assembled in Modjo, Ethiopia.",
    images: [
      {
        url: "/images/soreti-logo.png",
        width: 1200,
        height: 630,
        alt: "ETUK Electric 3-Wheeler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ETUK - Electric 3-Wheelers",
    description: "Ethiopia's premier electric 3-wheeler by Soreti International Trading",
    images: ["/images/soreti-logo.png"],
  },
  alternates: {
    canonical: "https://etuk.soretiinternational.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <I18nProvider>
              {children}
              <Toaster />
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
