import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Partners | Dependencies",
  description: "Meet the organizations and companies that support MEC Computer Club.",
};

import { getPartners } from "@/data/partners";

export default async function PartnersPage() {
  const partnerList = await getPartners();

  return (
    <main className="section container">
      <div className="section-header text-center">
        <span className="kicker">Collaborate</span>
        <h2>Dependencies (Our Partners)</h2>
        <p>We are proud to be supported by these amazing organizations.</p>
      </div>

      <div className="grid grid--3 stagger-children" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {partnerList.map((partner, i) => (
          <div key={i} className="card card--hoverable" style={{ padding: 'var(--space-5)', background: 'var(--surface-elevated)', border: '2px solid var(--text-primary)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ padding: '4px 12px', background: 'var(--accent-secondary)', color: 'var(--surface-primary)', display: 'inline-block', borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              {partner.type}
            </div>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{partner.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: '1.5' }}>
              {partner.desc}
            </p>
          </div>
        ))}
      </div>
      
      <div className="text-center" style={{ marginTop: 'var(--space-8)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Want to see your company here?</p>
        <a href="/collaborate/sponsor" style={{ color: 'var(--accent-primary-hover)', fontWeight: 'bold', textDecoration: 'underline' }}>Become a Sponsor</a>
      </div>
    </main>
  );
}
