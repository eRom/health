/**
 * Registration Lock Utility
 * 
 * Provides functions to check if user registration is enabled/disabled
 * based on environment variables.
 */

/**
 * Checks if user registration is currently enabled
 * @returns true if registration is enabled, false if disabled
 */
export function isRegistrationEnabled(): boolean {
  const disableRegistration = process.env.DISABLE_REGISTRATION;
  
  // If DISABLE_REGISTRATION is explicitly set to "true", disable registration
  // Otherwise, registration is enabled (default behavior)
  return disableRegistration !== "true";
}

/**
 * Gets a user-friendly message for registration status
 * @param locale - The user's locale ("fr" or "en")
 * @returns Localized message about registration status
 */
export function getRegistrationStatusMessage(locale: string = "fr"): string {
  const isEnabled = isRegistrationEnabled();
  
  if (isEnabled) {
    return locale === "fr" 
      ? "Les inscriptions sont ouvertes" 
      : "Registrations are open";
  }
  
  return locale === "fr"
    ? "Les inscriptions sont temporairement fermées"
    : "Registrations are temporarily closed";
}
