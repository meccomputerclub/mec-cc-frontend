import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Constitution | README.md",
  description: "The official constitution and guidelines of MEC Computer Club.",
};

export default function ConstitutionPage() {
  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Official Document</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
            README.md (Constitution)
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px] mt-3">
            The rules, regulations, and core values that govern the MEC Computer Club.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-surface-secondary">
        <div className="container max-w-[var(--max-width-narrow)] mx-auto px-4 md:px-8">
          <article className="bg-surface-primary border border-border-brutalist p-6 md:p-8 transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-[2px] hover:-translate-y-[2px]">
            <h2 className="text-2xl font-bold text-text-primary mt-0 mb-3 pb-2 border-b-2 border-border-default">
              Article I: Name &amp; Purpose
            </h2>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              <strong className="text-text-primary font-mono [font-feature-settings:'liga'_0,'calt'_0]">Section 1.</strong> The name of this organization shall be the MEC Computer Club.
            </p>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              <strong className="text-text-primary font-mono [font-feature-settings:'liga'_0,'calt'_0]">Section 2.</strong> The purpose of this club is to foster a community of tech enthusiasts, 
              provide a platform for learning and collaboration, and to promote computer science education 
              through workshops, seminars, and competitive programming.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mt-6 mb-3 pb-2 border-b-2 border-border-default">
              Article II: Membership
            </h2>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              <strong className="text-text-primary font-mono [font-feature-settings:'liga'_0,'calt'_0]">Section 1.</strong> Membership is open to all students of MEC who have an interest in computing.
            </p>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              <strong className="text-text-primary font-mono [font-feature-settings:'liga'_0,'calt'_0]">Section 2.</strong> Active members must attend at least 50% of general meetings and participate 
              in club activities to maintain their voting rights.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mt-6 mb-3 pb-2 border-b-2 border-border-default">
              Article III: Executive Committee
            </h2>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              <strong className="text-text-primary font-mono [font-feature-settings:'liga'_0,'calt'_0]">Section 1.</strong> The Executive Committee shall consist of the President, Vice President, 
              General Secretary, and Department Leads.
            </p>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              <strong className="text-text-primary font-mono [font-feature-settings:'liga'_0,'calt'_0]">Section 2.</strong> Elections for the Executive Committee will be held annually during the Spring semester.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mt-6 mb-3 pb-2 border-b-2 border-border-default">
              Article IV: Code of Conduct
            </h2>
            <p className="text-base leading-relaxed text-text-secondary mb-4">
              All members must adhere to a strict code of conduct promoting respect, inclusivity, and academic integrity. 
              Harassment or discrimination of any kind will result in immediate termination of membership.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
