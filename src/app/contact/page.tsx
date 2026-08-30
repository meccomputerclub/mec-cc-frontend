"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import "./contact.css";

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

  return (
    <section className="section contact-page">
      <div className="container container--narrow">
        <div className="contact-header">
          <span className="kicker">Contact Us</span>
          <h1>Ping Us! We&apos;re Listening</h1>
          <p>
            Have a question, want to collaborate, or inquiring about club recruitment and invitation keys?
            We read every transmission and usually reply within 24 hours.
          </p>
        </div>

        {urlReason === "invite" && (
          <div
            style={{
              background: "rgba(132, 204, 22, 0.1)",
              border: "1px solid rgba(132, 204, 22, 0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              marginBottom: "var(--space-6)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <KeyRound size={24} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)", lineHeight: 1.5 }}>
              <strong>Invitation Key Inquiry:</strong> Provide your full name, student ID, and institutional email below. Our membership executives will cross-verify your offline joining form and dispatch your access key.
            </div>
          </div>
        )}

        <div className="contact-grid">
          {/* Left Column: Reassurance & Alternatives */}
          <div className="contact-info">
            <div className="contact-card">
              <h3>Hate filling out forms?</h3>
              <p>Skip the wait. DM us directly on Discord or shoot us an email. We are highly active on both.</p>
              <a href="mailto:hello@mec-cc.edu.bd">hello@mec-cc.edu.bd</a>
            </div>

            <div className="contact-card">
              <h3>Membership &amp; Keys</h3>
              <p>Inquiring about offline recruitment, billing verification, or executive approval?</p>
              <a href="mailto:membership@mec-cc.edu.bd">membership@mec-cc.edu.bd</a>
            </div>

            <div className="contact-card">
              <h3>Find Us IRL</h3>
              <p>
                <strong>MEC Campus, Building 2</strong>
                <br />
                Room 402 (The Club Room)
                <br />
                Open Mon-Thu, 10am - 4pm
              </p>
            </div>
          </div>

          {/* Right Column: The Brutalist Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-header">
              <h3>Initialize Transmission</h3>
              <p>sys.contact_protocol // secure</p>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Farhan Ahmed"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@student.mec.edu.bd"
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject Area</label>
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
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your message here..."
              ></textarea>
            </div>

            <div className="form-actions">
              <Button type="submit" fullWidth disabled={sending}>
                {sending ? "Transmitting..." : "Send Message"}
              </Button>
            </div>

            {/* Interactive Terminal Feedback */}
            <div className={`terminal-status ${isTyping ? "typing" : "idle"}`}>
              <span>{isTyping ? "> receiving_input..." : "> awaiting_input"}</span>
              <span className="cursor-blink"></span>
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
        <div className="contact-page">
          <div className="container text-center">
            <p style={{ color: "var(--text-secondary)" }}>Loading contact transmission...</p>
          </div>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
