"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

interface CountdownTimerProps {
  expiresAt: string; // ISO Date String
}

/**
 * Renders a live countdown timer until the specified expiration date.
 * Automatically stops and displays "EXPIRED" when the time is up.
 */
const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt }) => {
  // Calculate the target time once
  const expiresAtTime = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);

  // State to hold the time difference in milliseconds
  const [distance, setDistance] = useState(expiresAtTime - new Date().getTime());

  // Function to format milliseconds into D H M S string
  const formatTime = useCallback((dist: number): string => {
    if (dist < 0) return "EXPIRED";

    const days = Math.floor(dist / (1000 * 60 * 60 * 24));
    const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((dist % (1000 * 60)) / 1000);

    const parts = [];
    // Only show days if 1 or more days remaining
    if (days > 0) parts.push(`${days}d`);

    // Always show H, M, S
    parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  }, []);

  // Effect hook to manage the timer interval
  useEffect(() => {
    // Function to update the distance state
    const updateCountdown = () => {
      const now = new Date().getTime();
      const newDistance = expiresAtTime - now;
      setDistance(newDistance);

      // If expired, the cleanup function will run on the next render loop
    };

    // Initial call to set the distance immediately
    updateCountdown();

    // Set up the interval to run every 1 second (1000ms)
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup function: Clear the interval when the component unmounts or before re-running the effect
    return () => clearInterval(interval);
  }, [expiresAtTime]); // Dependent on the calculated expiration time

  const remainingTime = formatTime(distance);
  const isExpired = distance < 0;

  return (
    <p
      className={`text-sm font-medium ${
        isExpired ? "text-gray-500 line-through" : "text-orange-500 dark:text-orange-400"
      }`}
    >
      Valid for: {remainingTime}
    </p>
  );
};

export default CountdownTimer;
