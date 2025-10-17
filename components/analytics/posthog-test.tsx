"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posthog?: any;
  }
}

export function PostHogTest() {
  const pathname = usePathname();

  useEffect(() => {
    // Only test on homepage
    if (pathname === "/fr" || pathname === "/en") {
      // Wait a bit for PostHog to initialize
      const timer = setTimeout(() => {
        // Access PostHog from window object
        if (typeof window !== "undefined" && window.posthog) {
          window.posthog.capture("homepage_test", {
            property: "test_value",
            timestamp: new Date().toISOString(),
            pathname: pathname,
            userAgent: navigator.userAgent,
          });
          console.log("PostHog test event sent:", "homepage_test");
        } else {
          console.warn("PostHog not available for testing");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
    // Return undefined for non-homepage paths
    return undefined;
  }, [pathname]);

  return null; // This component doesn't render anything
}
