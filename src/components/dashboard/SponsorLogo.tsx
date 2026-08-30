"use client";
import Image from "next/image";
import { DollarSign } from "lucide-react";
import { useAdaptiveLogoBackground } from "@/hooks/useAdaptiveLogoBackground";

interface SponsorLogoProps {
  logoUrl?: string | null;
  name: string;
  size?: number; // container size in px, default 64
}

/**
 * Sponsor logo with an auto-detected background color.
 * Analyzes the logo pixels via canvas and picks:
 *   - Dark charcoal (#2E2E2E) for white/light logos
 *   - Clean white (#FFFFFF) for colorful logos
 *   - Off-white (#F5F5F5) for dark logos
 */
export default function SponsorLogo({ logoUrl, name, size = 64 }: SponsorLogoProps) {
  const bgColor = useAdaptiveLogoBackground(logoUrl);

  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden border border-border-default flex items-center justify-center transition-colors duration-300"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
      }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={size - 16}
          height={size - 16}
          className="w-full h-full object-contain p-2"
          unoptimized
        />
      ) : (
        <DollarSign
          size={size * 0.375}
          style={{ color: bgColor === "#2E2E2E" ? "#888888" : "#9CA3AF" }}
        />
      )}
    </div>
  );
}
