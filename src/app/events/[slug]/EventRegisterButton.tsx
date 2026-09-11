"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Event } from "@/types";
import { ExternalLink, FileText, Clock } from "lucide-react";
import { EventRegistrationModal } from "./EventRegistrationModal";
import toast from "react-hot-toast";

interface EventRegisterButtonProps {
  event: Event;
}

export function EventRegisterButton({ event }: EventRegisterButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if deadline has passed
  const isDeadlinePassed = event.registrationDeadline
    ? new Date() > new Date(event.registrationDeadline)
    : false;

  if (isDeadlinePassed) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button size="lg" disabled className="opacity-60 cursor-not-allowed">
          Registration Closed
        </Button>
        <span className="text-xs text-text-tertiary font-mono">
          Deadline passed on {event.registrationDeadline}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {event.linkedForm ? (
          <Button
            size="lg"
            id="event-register-cta"
            href={`/forms/${event.linkedForm}`}
            className="shadow-[4px_4px_0px_0px_var(--border-brutalist)] font-bold"
          >
            <FileText size={18} className="mr-2" /> Register for Event →
          </Button>
        ) : event.registrationUrl ? (
          <Button
            size="lg"
            id="event-register-cta"
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-[4px_4px_0px_0px_var(--border-brutalist)] font-bold"
          >
            <ExternalLink size={18} className="mr-2" /> Register on External Portal ↗
          </Button>
        ) : (
          <Button
            size="lg"
            id="event-register-cta"
            onClick={() => setIsModalOpen(true)}
            className="shadow-[4px_4px_0px_0px_var(--border-brutalist)] font-bold"
          >
            <FileText size={18} className="mr-2" /> Register for Event →
          </Button>
        )}

        {event.linkedForm && event.registrationUrl && (
          <Button
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
            className="text-xs font-mono"
          >
            External Link <ExternalLink size={13} className="ml-1.5" />
          </Button>
        )}
      </div>

      <EventRegistrationModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          toast.success("Registration submitted! Organizers will review your request.");
        }}
      />
    </>
  );
}
