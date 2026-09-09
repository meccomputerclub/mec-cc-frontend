export const revalidate = 60;

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPartners } from "@/data/partners";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Handshake } from "lucide-react";
import { getOptimizedImageUrl } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Our Partners & Sponsors | MEC Computer Club",
  description: "Meet the organizations and companies that support MEC Computer Club.",
};

export default async function PartnersPage() {
  const partnerList = await getPartners();

  return (
    <main className="min-h-screen py-12 sm:py-16">
      <div className="container">
        {/* Page Header */}
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <span className="kicker">Collaborate</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            Our Partners &amp; Sponsors
          </h1>
          <p className="text-base sm:text-lg text-text-tertiary">
            We are immensely grateful to the forward-thinking companies and organizations that empower our students, sponsor our contests, and mentor our members.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {partnerList.map((partner, i) => {
            const isWhiteMonochrome =
              partner.name?.toLowerCase().includes("paper") ||
              partner.logoUrl?.includes("1777010120574");

            const CardContent = (
              <div className="flex flex-col justify-between h-full p-6 bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] hover:shadow-[6px_6px_0px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 group text-center">
                <div>
                  {/* Logo Container */}
                  <div className="relative h-20 w-full flex items-center justify-center p-2 mb-4 overflow-hidden bg-transparent">
                    {partner.logoUrl ? (
                      <Image
                        src={getOptimizedImageUrl(partner.logoUrl, 360)}
                        alt={partner.name}
                        width={180}
                        height={70}
                        className={`max-h-12 max-w-[85%] w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
                          isWhiteMonochrome
                            ? "[html:not(.dark)_&]:brightness-0 [html:not(.dark)_&]:contrast-200 dark:brightness-100"
                            : ""
                        }`}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary font-mono font-extrabold text-base flex items-center justify-center border border-accent-primary/25">
                        {partner.logoPlaceholder || partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <span className="font-mono text-xs font-bold py-1 px-3 rounded-full bg-accent-primary-light text-accent-primary-text border border-accent-primary/20 uppercase tracking-wide inline-block mb-2.5">
                    {partner.type}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-text-primary group-hover:text-accent-primary transition-colors mb-2">
                    {partner.name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {partner.desc}
                  </p>
                </div>

                {/* Footer Link if available */}
                {partner.website && (
                  <div className="mt-4 pt-3 border-t border-border-default/60 flex items-center justify-center gap-1 text-xs font-mono font-bold text-accent-primary group-hover:underline">
                    <span>Visit Website</span>
                    <ExternalLink size={12} />
                  </div>
                )}
              </div>
            );

            return partner.website ? (
              <a
                key={partner.id || `${partner.name}-${i}`}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-left block h-full"
                aria-label={`Visit ${partner.name} website`}
              >
                {CardContent}
              </a>
            ) : (
              <div key={partner.id || `${partner.name}-${i}`} className="block h-full">
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-surface-secondary/60 rounded-2xl border border-dashed border-border-default max-w-xl mx-auto">
          <Handshake size={32} className="mx-auto text-accent-primary mb-2 opacity-80" />
          <h3 className="text-lg font-bold text-text-primary mb-1">Want to collaborate with MEC-CC?</h3>
          <p className="text-sm text-text-tertiary mb-4">
            Partner with us to reach talented engineering students, sponsor events, and host tech workshops.
          </p>
          <Button href="/collaborate/sponsor" id="partners-become-sponsor">
            Become a Sponsor →
          </Button>
        </div>
      </div>
    </main>
  );
}
