"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { KeyRound, Mail, MapPin, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";

function ContactContent() {
  const searchParams = useSearchParams();
  const urlSubject = searchParams.get("subject") || "general";
  const urlReason = searchParams.get("reason") || "";
  const urlEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: urlEmail,
    subject: urlSubject,
    message:
      urlReason === "invite"
        ? "Hello MEC CC Executives, I completed my offline joining billing during recruitment but have not received my access key yet. My student ID and details are: "
        : urlReason === "approval-status"
        ? "Hello Admins, I submitted my online membership application and verified my email. Inquiring about the approval status for my student node."
        : "",
  });

  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (urlSubject) {
      setFormData((prev) => ({
        ...prev,
        subject: urlSubject,
        email: urlEmail || prev.email,
      }));
    }
  }, [urlSubject, urlEmail]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Terminal feedback logic
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/api/contact-messages", formData);
      toast.success("Transmission received! We'll get back to you shortly.");
      setFormData({ name: "", email: "", subject: "general", message: "" });
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to send message.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const inputClasses =
    "w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-border-brutalist rounded-[var(--radius-md)] bg-surface-primary font-inherit text-sm sm:text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] transition-all duration-200 focus:outline-none focus:border-border-brutalist focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:translate-x-[-2px] focus:translate-y-[-2px]";

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <span className="kicker">Contact Us</span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-text-primary mt-3 mb-4 tracking-tight">
            Ping Us! We&apos;re Listening
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Have a question, want to collaborate, or inquiring about club recruitment and invitation keys?
            We read every transmission and usually reply within 24 hours.
          </p>
        </div>

        {/* Invite Notice */}
        {urlReason === "invite" && (
          <div className="bg-lime-500/10 border border-lime-500/30 rounded-[var(--radius-lg)] p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <KeyRound size={24} className="text-accent-primary shrink-0" />
            <div className="text-xs sm:text-sm text-text-primary leading-relaxed">
              <strong>Invitation Key Inquiry:</strong> Provide your full name, student ID, and institutional email below. Our membership executives will cross-verify your offline joining form and dispatch your access key.
            </div>
          </div>
        )}

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-8">
          {/* Left Column: Info Cards */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="bg-surface-secondary p-5 sm:p-6 rounded-[var(--radius-lg)] border border-border-brutalist transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
              <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary mb-2 flex items-center gap-2">
                <MessageSquare size={18} className="text-accent-primary" />
                Hate filling out forms?
              </h3>
              <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                Skip the wait. DM us directly on Discord or shoot us an email. We are highly active on both.
              </p>
              <a
                href="mailto:hello@mec-cc.edu.bd"
                className="font-mono text-sm sm:text-base font-bold text-accent-primary-hover underline transition-colors hover:text-accent-primary break-all"
              >
                hello@mec-cc.edu.bd
              </a>
            </div>

            <div className="bg-surface-secondary p-5 sm:p-6 rounded-[var(--radius-lg)] border border-border-brutalist transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
              <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary mb-2 flex items-center gap-2">
                <Mail size={18} className="text-accent-primary" />
                Membership &amp; Keys
              </h3>
              <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                Inquiring about offline recruitment, billing verification, or executive approval?
              </p>
              <a
                href="mailto:membership@mec-cc.edu.bd"
                className="font-mono text-sm sm:text-base font-bold text-accent-primary-hover underline transition-colors hover:text-accent-primary break-all"
              >
                membership@mec-cc.edu.bd
              </a>
            </div>

            <div className="bg-surface-secondary p-5 sm:p-6 rounded-[var(--radius-lg)] border border-border-brutalist transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
              <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-accent-primary" />
                Find Us IRL
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                <strong className="text-text-primary">MEC Campus, Building 2</strong>
                <br />
                Room 402 (The Club Room)
                <br />
                Open Mon-Thu, 10am - 4pm
              </p>
            </div>
          </div>

          {/* Right Column: The Form */}
          <form
            className="bg-surface-elevated p-5 sm:p-7 rounded-[var(--radius-lg)] border border-border-brutalist flex flex-col transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 pb-3 border-b-2 border-border-default">
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-text-primary mb-1">
                Initialize Transmission
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary font-mono tracking-tight">
                sys.contact_protocol // secure
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block font-medium text-sm text-text-primary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Farhan Ahmed"
                className={inputClasses}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block font-medium text-sm text-text-primary mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@student.mec.edu.bd"
                className={inputClasses}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subject" className="block font-medium text-sm text-text-primary mb-1.5">
                Subject Area
              </label>
              <Select
                id="subject"
                required
                value={formData.subject}
                onChange={handleSelectChange}
                options={[
                  { value: "membership", label: "Membership & Invitation Key" },
                  { value: "general", label: "General Inquiry" },
                  { value: "sponsorship", label: "Sponsorship" },
                  { value: "collaboration", label: "Event Collaboration" },
                ]}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block font-medium text-sm text-text-primary mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                className={inputClasses}
              ></textarea>
            </div>

            <div className="mt-2 sm:mt-auto pt-3 sm:pt-4">
              <Button type="submit" fullWidth disabled={sending}>
                {sending ? "Transmitting..." : "Send Message"}
              </Button>
            </div>

            {/* Interactive Terminal Feedback */}
            <div
              className={`mt-4 p-3 bg-black font-mono text-xs rounded-[var(--radius-sm)] flex items-center gap-2 overflow-x-auto ${
                isTyping ? "text-[#00ff66]" : "text-neutral-500"
              }`}
            >
              <span>{isTyping ? "> receiving_input..." : "> awaiting_input"}</span>
              <span className="inline-block w-2 h-3.5 bg-current animate-pulse"></span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <p className="text-text-secondary font-mono">Loading contact transmission...</p>
          </div>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
