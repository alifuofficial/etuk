import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n/useI18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETUK - Electric 3-Wheelers | Soreti International Trading",
  description: "Ethiopia's premier electric 3-wheeler. Heavy-duty electric vehicles designed for African roads. Join our network of agents across Ethiopia.",
  keywords: ["ETUK", "Electric 3-Wheeler", "Ethiopia", "Soreti", "Electric Vehicle", "Sustainable Transport"],
  authors: [{ name: "Soreti International Trading" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ETUK - Electric 3-Wheelers",
    description: "Power Your Journey with ETUK - Ethiopia's Premier Electric 3-Wheeler",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
