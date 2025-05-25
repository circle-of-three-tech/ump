import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "./components/layout/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NavigationEvents } from "./components/NavigationEvents";
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
  title: "UniMarkets - University Student Marketplace",
  description: "Buy, sell, and swap items securely within your university community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>
          <ErrorBoundary>
            <NavigationEvents />
            <Header />
            <main className="container mx-auto py-4 px-4">
              {children}
            </main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
