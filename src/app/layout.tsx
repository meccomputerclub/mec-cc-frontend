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
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meccomputerclub.org"),
  title: {
    template: "%s | MEC Computer Club",
    default: "MEC Computer Club | Official Website — CP Practice, Real Projects & Tech Community",
  },
  description:
    "The official computer club of Murari Chand College (MEC), Sylhet. Weekly competitive programming, ICPC training, real-world software development, AI/ML, cybersecurity, and tech events.",
  keywords: [
    "MEC Computer Club",
    "meccomputerclub.org",
    "MEC CC",
    "Murari Chand College Computer Club",
    "MEC Sylhet",
    "MEC CSE Club",
    "Competitive Programming Sylhet",
    "ICPC MEC",
    "MEC Judge",
    "Sylhet tech community",
    "Bangladesh student programming club",
    "MEC programming club",
    "MEC tech events",
    "Murari Chand College tech club",
  ],
  authors: [{ name: "MEC Computer Club", url: "https://meccomputerclub.org" }],
  creator: "MEC Computer Club",
  publisher: "MEC Computer Club",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://meccomputerclub.org",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meccomputerclub.org",
    siteName: "MEC Computer Club",
    title: "MEC Computer Club | Weekly CP Practice, Real Projects, One Club",
    description:
      "The official computer club of MEC, Sylhet. Join 70+ members competing in ICPC, building production software, and advancing student technology careers.",
    images: [
      {
        url: "/mec-club-photo.jpg",
        width: 1200,
        height: 630,
        alt: "MEC Computer Club Members & Activities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MEC Computer Club | Official Website",
    description:
      "Weekly CP practice, real projects, one club. The official student tech community of Murari Chand College (MEC), Sylhet.",
    images: ["/mec-club-photo.jpg"],
  },
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://meccomputerclub.org/#organization",
  "name": "MEC Computer Club",
  "alternateName": [
    "MEC CC",
    "Murari Chand College Computer Club",
    "MEC Programming Club",
    "Sylhet MEC Computer Club"
  ],
  "url": "https://meccomputerclub.org",
  "logo": "https://meccomputerclub.org/logo-lime-dark.png",
  "image": "https://meccomputerclub.org/mec-club-photo.jpg",
  "description": "The official student technology and competitive programming organization of Murari Chand College (MEC), Sylhet. Providing weekly CP practices, software development projects, hackathons, and career workshops.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Tilagarh",
    "addressLocality": "Sylhet",
    "postalCode": "3100",
    "addressRegion": "Sylhet Division",
    "addressCountry": "BD"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+8801700000000",
    "contactType": "general inquiries",
    "email": "meccomputerclub@gmail.com",
    "areaServed": "BD",
    "availableLanguage": ["English", "Bengali"]
  },
  "sameAs": [
    "https://facebook.com/meccomputerclub",
    "https://github.com/mec-cs-club",
    "https://linkedin.com/company/meccomputerclub"
  ],
  "department": [
    {
      "@type": "Organization",
      "name": "Competitive Programming Wing",
      "description": "National contests, intra-college coding competitions, and weekly problem-solving sessions."
    },
    {
      "@type": "Organization",
      "name": "Web & Software Engineering Wing",
      "description": "Production web systems, open-source software, and full-stack development."
    },
    {
      "@type": "Organization",
      "name": "AI & Machine Learning Wing",
      "description": "Data science, machine learning models, and NLP chatbots."
    },
    {
      "@type": "Organization",
      "name": "Cybersecurity & Systems Wing",
      "description": "Network defense, ethical hacking, CTFs, and Linux system administration."
    }
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <SiteSettingsProvider>
              <ScaleWrapper>
                <Toaster position="bottom-right" />
                <Navbar />
                <main id="main-content" className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-var(--nav-height))]">
                  {children}
                </main>
                <Footer />
                <AccentIndicator />
              </ScaleWrapper>
            </SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
