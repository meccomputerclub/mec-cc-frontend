import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Download,
  ExternalLink,
  FileText,
  FileDown,
  Calendar,
  User,
  Tag,
  Share2,
} from "lucide-react";
import { getPageContent } from "@/lib/pageContent";
import { cpResources } from "@/data/cp";
import { CPResource } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getPdfProxyUrl, isPdfDocument } from "@/lib/pdfUtils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cpContent = await getPageContent("cp-hub");
  const allDocs: CPResource[] = [
    ...(cpContent?.clubDocs || []),
    ...cpResources,
  ];

  const doc = allDocs.find((d) => d.id === id || d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id);

  if (!doc) {
    return { title: "Document Not Found | MEC Computer Club" };
  }

  return {
    title: `${doc.title} | MEC Computer Club CP Hub`,
    description: `Official tutorial and learning resource published by MEC Computer Club: ${doc.title} by ${doc.author || "Club Member"}.`,
  };
}

export default async function DocViewerPage({ params }: PageProps) {
  const { id } = await params;
  const cpContent = await getPageContent("cp-hub");
  const allDocs: CPResource[] = [
    ...(cpContent?.clubDocs || []),
    ...cpResources,
  ];

  const doc = allDocs.find(
    (d) => d.id === id || d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id
  );

  if (!doc) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center space-y-6">
        <div className="p-8 bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl shadow-[6px_6px_0px_var(--accent-primary)] space-y-4">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto" />
          <h1 className="text-2xl font-bold text-text-primary">Document Not Found</h1>
          <p className="text-sm text-text-secondary">
            The requested document or editorial could not be located in our club library.
          </p>
          <Button href="/cp-hub?tab=resources" variant="primary" icon={<ChevronLeft size={16} />}>
            Back to CP Hub Resources
          </Button>
        </div>
      </div>
    );
  }

  const rawFileUrl = doc.pdfUrl || doc.url || "";
  const isPdf = isPdfDocument(doc);
  const pdfViewUrl = isPdf ? getPdfProxyUrl(rawFileUrl, false, `${doc.title}.pdf`) : rawFileUrl;
  const pdfDownloadUrl = isPdf ? getPdfProxyUrl(rawFileUrl, true, `${doc.title}.pdf`) : rawFileUrl;

  return (
    <div className="min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-6">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 border-b border-border-default pb-4">
          <Link
            href="/cp-hub?tab=resources"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-text-secondary hover:text-accent-primary transition-colors"
          >
            <ChevronLeft size={16} /> Back to Resources
          </Link>

          <span className="font-mono text-xs text-text-tertiary uppercase hidden sm:inline">
            MEC CP Hub / Document Viewer
          </span>
        </div>

        {/* Document Header Card */}
        <div className="p-6 bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl shadow-[6px_6px_0px_var(--accent-primary)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  doc.difficulty === "beginner"
                    ? "active"
                    : doc.difficulty === "intermediate"
                    ? "info"
                    : "pending"
                }
                size="md"
              >
                {doc.difficulty}
              </Badge>
              <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded bg-surface-secondary border border-border-default text-text-primary">
                {doc.type}
              </span>
              {isPdf && (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                  <FileDown size={13} /> PDF
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
              {doc.title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-text-secondary flex-wrap">
              {doc.author && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
                  <User size={14} className="text-accent-primary" /> By {doc.author}
                </span>
              )}
              {doc.date && (
                <span className="inline-flex items-center gap-1 font-mono text-text-tertiary">
                  <Calendar size={13} /> {doc.date}
                </span>
              )}
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {doc.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs py-0.5 px-2.5 bg-surface-secondary rounded-lg border border-border-default text-text-tertiary"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {isPdf && (
              <>
                <Button
                  variant="primary"
                  size="md"
                  href={pdfDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<Download size={16} />}
                >
                  Download PDF
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  href={pdfViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<ExternalLink size={16} />}
                >
                  Open Full Screen
                </Button>
              </>
            )}

            {!isPdf && doc.url && (
              <Button
                variant="primary"
                size="md"
                href={doc.url}
                target={doc.url.startsWith("/") ? undefined : "_blank"}
                icon={<ExternalLink size={16} />}
              >
                Go to Resource
              </Button>
            )}
          </div>
        </div>

        {/* Document Reader Container */}
        {isPdf ? (
          <div className="space-y-3">
            <div className="w-full bg-surface-secondary/40 border-2 border-border-brutalist dark:border-border-default rounded-2xl shadow-[6px_6px_0px_0px_var(--border-default)] overflow-hidden">
              <iframe
                src={pdfViewUrl}
                className="w-full h-[85vh] bg-white dark:bg-slate-950"
                title={doc.title}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-text-tertiary px-2">
              <span>MEC Document Reader — High Definition Stream</span>
              <span>
                Browser not rendering?{" "}
                <a
                  href={pdfDownloadUrl}
                  className="text-accent-primary font-bold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download the file directly
                </a>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-elevated border border-border-default rounded-2xl space-y-4">
            <p className="text-text-primary font-semibold">
              This resource redirects to an external or custom page.
            </p>
            <Button
              variant="primary"
              href={doc.url}
              target={doc.url.startsWith("/") ? undefined : "_blank"}
              icon={<ExternalLink size={16} />}
            >
              Launch Resource Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
