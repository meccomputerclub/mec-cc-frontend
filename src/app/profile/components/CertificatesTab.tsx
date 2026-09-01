"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Award, Copy, ExternalLink, ShieldCheck, X } from "lucide-react";

interface CertificatesTabProps {
  user: AuthUser;
  certificates: any[];
}

export function CertificatesTab({ user, certificates }: CertificatesTabProps) {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const copyCredentialId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Credential ID copied to clipboard!");
  };

  return (
    <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">Earned Certificates &amp; Credentials ({certificates.length})</h2>
          <p className="font-body text-xs text-text-secondary mt-0.5">Official verified achievements issued by the MEC Computer Club executive committee.</p>
        </div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert, idx) => {
            const credId = cert.credentialId || cert._id || `CERT-${idx + 1}`;
            return (
              <div
                key={cert._id || idx}
                className="bg-surface-secondary border-[1.5px] border-border-default rounded-md p-4 flex flex-col gap-2.5 transition-all duration-150 hover:border-accent-primary hover:shadow-[3px_3px_0px_0px_var(--accent-primary)] hover:-translate-x-px hover:-translate-y-px"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-sm font-mono text-[10px] font-extrabold uppercase tracking-wider bg-accent-success-light text-accent-success border border-accent-success">
                    <ShieldCheck size={11} /> Verified
                  </span>
                  <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-sm font-mono text-[10px] font-extrabold uppercase tracking-wider bg-surface-elevated text-text-secondary border border-border-default">
                    {cert.category || "Achievement"}
                  </span>
                </div>

                <h3 className="font-heading text-base font-extrabold text-text-primary m-0 leading-snug">
                  {cert.title || cert.eventName || "Certificate of Excellence"}
                </h3>

                <div className="flex flex-col gap-1 text-xs text-text-secondary">
                  <div>
                    <strong className="font-bold text-text-primary">Recipient:</strong> {cert.recipientName || user.fullName}
                  </div>
                  <div>
                    <strong className="font-bold text-text-primary">Issued:</strong> {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "Active"}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary">
                    <span>ID: {credId}</span>
                    <button
                      type="button"
                      onClick={() => copyCredentialId(credId)}
                      className="bg-transparent border-none cursor-pointer text-text-tertiary hover:text-text-primary transition-colors p-0.5"
                      title="Copy ID"
                      aria-label="Copy credential ID"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-dashed border-border-default">
                  <Button size="sm" variant="outline" onClick={() => setSelectedCert(cert)}>
                    View Certificate
                  </Button>
                  <Button href={`/verify?certificate=${credId}`} variant="ghost" size="sm">
                    Verify Link <ExternalLink size={12} style={{ marginLeft: "4px" }} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <Award size={48} className="mx-auto mb-3 opacity-40 text-accent-primary" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No Certificates Issued Yet</h3>
          <p className="max-w-md mx-auto mb-4 text-sm text-text-secondary">
            Participate in club hackathons, competitive programming workshops, and semester contests to earn official blockchain-verifiable credentials.
          </p>
          <Button href="/events" size="sm">View Upcoming Opportunities</Button>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease_forwards]" onClick={() => setSelectedCert(null)}>
          <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--accent-primary)] p-5 sm:p-6 relative text-center animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
              <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-mono text-xs font-extrabold uppercase tracking-wider bg-accent-success-light text-accent-success border border-accent-success">
                <ShieldCheck size={12} /> Official Credential
              </span>
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 bg-surface-secondary border border-border-default rounded-sm text-text-primary cursor-pointer font-extrabold transition-all duration-150 hover:bg-accent-primary-light hover:rotate-90"
                onClick={() => setSelectedCert(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-6 px-4 bg-surface-secondary rounded-xl border-2 border-border-default relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Award size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-text-primary m-0 mb-1">
                {selectedCert.title || "Certificate of Excellence"}
              </h2>
              <p className="text-text-secondary text-sm m-0 mb-4">
                Awarded by <strong className="font-bold text-text-primary">MEC Computer Club</strong>
              </p>

              <div className="border-t border-b border-dashed border-border-default py-4 my-4">
                <p className="text-xs text-text-tertiary uppercase font-bold tracking-wider m-0">Proudly Presented To</p>
                <h3 className="text-2xl font-black text-accent-primary my-1">
                  {selectedCert.recipientName || user.fullName}
                </h3>
                <p className="text-xs text-text-secondary m-0">
                  Student ID: {user.studentId} • {user.department || "CSE"}
                </p>
              </div>

              <p className="text-xs text-text-secondary m-0 mb-2">
                Issued on: {selectedCert.issueDate ? new Date(selectedCert.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
              <code className="text-[11px] font-mono bg-surface-elevated px-2 py-0.5 rounded border border-border-default text-text-primary">
                ID: {selectedCert.credentialId || selectedCert._id}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center">
              <Button href={`/verify?certificate=${selectedCert.credentialId || selectedCert._id}`} size="md">
                Open Public Verify Page ↗
              </Button>
              <Button variant="outline" size="md" onClick={() => copyCredentialId(selectedCert.credentialId || selectedCert._id)}>
                Copy Credential ID
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
