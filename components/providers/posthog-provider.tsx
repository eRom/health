"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { PostHog } from "posthog-js";
import { useEffect, useState } from "react";

let posthog: PostHog | undefined = undefined;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize in production
    if (process.env.NODE_ENV !== "production") {
      setIsInitialized(true);
      return;
    }

    // Initialize PostHog
    if (!posthog) {
      posthog = new PostHog();
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: "/ingest", // Use reverse proxy in production
        person_profiles: "identified_only", // GDPR compliance
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        disable_session_recording: false,
        mask_all_text: false,
        // EU region settings
        ui_host: "https://eu.i.posthog.com",
        // Privacy settings
        respect_dnt: true,
        opt_out_capturing_by_default: false,
        loaded: () => {
          console.log("PostHog loaded");
        },
      });
    }

    setIsInitialized(true);
  }, []);

  // Track page views
  useEffect(() => {
    if (!posthog || !isInitialized) return;

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    
    posthog.capture("$pageview", {
      $current_url: url,
      pathname,
      search: searchParams.toString(),
    });
  }, [pathname, searchParams, isInitialized]);

  // Identify user when session is available
  useEffect(() => {
    if (!posthog || !isInitialized) return;

    const identifyUser = async () => {
      try {
        const response = await fetch("/api/auth/get-session");
        if (response.ok) {
          const session = await response.json();
          if (session?.user) {
            posthog?.identify(session.user.id, {
              email: session.user.email,
              name: session.user.name,
              emailVerified: session.user.emailVerified,
            });
          }
        }
      } catch (error) {
        console.warn("Failed to identify user with PostHog:", error);
      }
    };

    identifyUser();
  }, [isInitialized]);

  return <>{children}</>;
}
