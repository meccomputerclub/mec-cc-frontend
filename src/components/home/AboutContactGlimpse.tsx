import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone, Clock, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AboutContactGlimpseProps {
  contactData?: {
    email?: string;
    presidentPhone?: string;
    generalSecretaryPhone?: string;
    location?: string;
  };
}

export function AboutContactGlimpse({ contactData }: AboutContactGlimpseProps = {}) {
  const email = contactData?.email || "meccomputerclub@gmail.com";
  const presidentPhone = contactData?.presidentPhone || "01773-758374";
  const generalSecretaryPhone = contactData?.generalSecretaryPhone || "01568985672";
  const location =
    contactData?.location ||
    "Department of CSE, Mymensingh Engineering College, Khagdahar, Mymensingh-2200";
  const mapsUrl =
    "https://maps.google.com/maps?q=Department%20of%20Computer%20Science%20and%20Engineering%2C%20Mymensingh%20Engineering%20College&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const externalMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Department+of+Computer+Science+and+Engineering+Mymensingh+Engineering+College";

  return (
    <section className="section bg-surface-secondary/50 border-t border-border-default" id="about-contact-glimpse">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
          <span className="kicker">Headquarters</span>
          <h2>Where Innovation Takes Place</h2>
          <p className="text-lg text-text-tertiary max-[768px]:text-base">
            Drop by our campus lab or reach out directly to the executive committee.
          </p>
        </div>

        {/* 2-Column Split: Info on Left, Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_var(--border-brutalist)]">
            <div>
              {/* Club Photo */}
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-border-default mb-5 shadow-sm">
                <Image
                  src="/mec-club-photo.jpg"
                  alt="MEC Computer Club Lab Workspace"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white font-mono text-[10px] px-2.5 py-1 rounded-md uppercase font-bold tracking-wider">
                  MEC-CC LAB
                </div>
              </div>

              {/* Club Identity */}
              <h3 className="text-2xl font-extrabold text-text-primary mb-1">
                MEC Computer Club
              </h3>
              <p className="font-mono text-xs font-semibold text-accent-primary-hover mb-5 uppercase tracking-wide">
                Dept. of Computer Science & Engineering
              </p>

              {/* Location & Contact Info */}
              <div className="space-y-3 font-sans text-sm text-text-secondary border-t border-border-default pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border-default flex items-center justify-center text-accent-primary-hover flex-shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <strong className="block text-text-primary text-xs font-mono uppercase tracking-wider">
                      Location
                    </strong>
                    <span>{location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border-default flex items-center justify-center text-accent-primary-hover flex-shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div>
                    <strong className="block text-text-primary text-xs font-mono uppercase tracking-wider">
                      Email Contact
                    </strong>
                    <a
                      href={`mailto:${email}`}
                      className="text-text-primary hover:text-accent-primary hover:underline transition-colors break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border-default flex items-center justify-center text-accent-primary-hover flex-shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <strong className="block text-text-primary text-xs font-mono uppercase tracking-wider">
                      Contact Numbers
                    </strong>
                    <div className="flex flex-col gap-1 text-sm mt-0.5">
                      <a
                        href={`tel:${presidentPhone.replace(/[^0-9+]/g, "")}`}
                        className="text-text-primary hover:text-accent-primary hover:underline transition-colors flex items-center gap-1.5"
                      >
                        <span className="font-mono">{presidentPhone}</span>
                        <span className="text-text-tertiary text-xs">(President)</span>
                      </a>
                      <a
                        href={`tel:${generalSecretaryPhone.replace(/[^0-9+]/g, "")}`}
                        className="text-text-primary hover:text-accent-primary hover:underline transition-colors flex items-center gap-1.5"
                      >
                        <span className="font-mono">{generalSecretaryPhone}</span>
                        <span className="text-text-tertiary text-xs">(General Secretary)</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-border-default flex-wrap">
              <Button href="/about" size="sm" className="flex-1 min-w-[120px]">
                About Us →
              </Button>
              <Button href="/contact" variant="secondary" size="sm" className="flex-1 min-w-[120px]">
                Send Message
              </Button>
            </div>
          </div>

          {/* Right Column (7 cols) - Interactive Google Map */}
          <div className="lg:col-span-7 flex flex-col bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl overflow-hidden shadow-[8px_8px_0px_var(--accent-primary)]">
            {/* Map Header bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-surface-secondary border-b border-border-default">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
                <span className="font-mono text-xs font-bold uppercase text-text-primary">
                  CSE Dept &bull; Campus Map
                </span>
              </div>
              <a
                href={externalMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-accent-primary-hover hover:underline inline-flex items-center gap-1"
              >
                OPEN IN MAPS <ExternalLink size={12} />
              </a>
            </div>

            {/* Map Iframe */}
            <div className="relative w-full flex-1 min-h-[360px] md:min-h-[420px] bg-surface-secondary">
              <iframe
                title="Department of Computer Science and Engineering, Mymensingh Engineering College"
                src={mapsUrl}
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Map Caption Footer */}
            <div className="px-5 py-3 bg-surface-primary border-t border-border-default flex items-center justify-between text-xs font-mono text-text-tertiary">
              <span>Mymensingh Engineering College Campus</span>
              <span className="text-text-secondary font-bold">24.7749° N, 90.3703° E</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
