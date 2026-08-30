"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";

interface EventRegisterButtonProps {
  eventId: string;
  externalUrl?: string;
}

export function EventRegisterButton({ eventId, externalUrl }: EventRegisterButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // If external form link exists, prioritize it
  if (externalUrl) {
    return (
      <Button href={externalUrl} size="lg" id="event-register-cta" target="_blank" rel="noopener noreferrer">
        Register for this event ↗
      </Button>
    );
  }

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please sign in to register for this event");
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/events/${eventId}/participants/register`);
      setRegistered(true);
      toast.success("Successfully registered for this event!");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to register for event";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <Button size="lg" disabled style={{ background: "#10b981", borderColor: "#10b981", color: "#fff" }}>
        ✓ Registered
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      id="event-register-cta"
      disabled={loading}
      onClick={handleRegister}
    >
      {loading ? "Registering..." : "Register with Student ID"}
    </Button>
  );
}
