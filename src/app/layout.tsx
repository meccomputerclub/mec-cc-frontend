import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccentIndicator } from "@/components/AccentIndicator";
import { ScaleWrapper } from "@/components/ScaleWrapper";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | MEC Computer Club",
    default: "MEC Computer Club",
  },
  description: "Weekly CP practice, real projects, one club. The official computer club of MEC.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ScaleWrapper>
              <Toaster position="bottom-right" />
              <Navbar />
              <main id="main-content" className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-var(--nav-height))]">
                {children}
              </main>
              <Footer />
              <AccentIndicator />
            </ScaleWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
