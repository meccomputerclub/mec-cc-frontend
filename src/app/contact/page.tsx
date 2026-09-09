import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Campus Location, Inquiries & Support",
  description:
    "Get in touch with the MEC Computer Club at Murari Chand College, Sylhet. Find room location, club emails, executive contacts, and partnership inquiries.",
  keywords: [
    "Contact MEC Computer Club",
    "MEC Computer Club email",
    "MEC Computer Club address",
    "MEC Computer Club phone",
    "Murari Chand College Computer Club contact",
    "MEC Sylhet club room",
    "MEC CC inquiry",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/contact",
  },
  openGraph: {
    title: "Contact MEC Computer Club | Office, Email & Communications",
    description:
      "Reach out to MEC Computer Club for student membership, hackathon collaborations, event sponsorships, or campus inquiries.",
    url: "https://meccomputerclub.org/contact",
    images: ["/mec-club-photo.jpg"],
  },
};

const jsonLdContact = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "MEC Computer Club Contact",
  "url": "https://meccomputerclub.org/contact",
  "description": "Official communication desk for MEC Computer Club, Murari Chand College, Sylhet.",
  "mainEntity": {
    "@type": "EducationalOrganization",
    "name": "MEC Computer Club",
    "url": "https://meccomputerclub.org",
    "email": "meccomputerclub@gmail.com",
    "telephone": "+8801700000000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Room 402, Building 2, Murari Chand College (MEC), Tilagarh",
      "addressLocality": "Sylhet",
      "postalCode": "3100",
      "addressCountry": "BD"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "10:00",
      "closes": "16:00"
    }
  }
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContact) }}
      />
      <Suspense
        fallback={
          <div className="py-16 text-center">
            <p className="text-text-secondary font-mono">Loading transmission protocol...</p>
          </div>
        }
      >
        <ContactForm />
      </Suspense>
    </>
  );
}
