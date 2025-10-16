/**
 * Google OAuth Registration Lock Middleware
 * 
 * This middleware intercepts Google OAuth requests and blocks new user registrations
 * when DISABLE_REGISTRATION is set to true, while allowing existing users to sign in.
 */

import { prisma } from "@/lib/prisma";
import { isRegistrationEnabled } from "@/lib/registration-lock";
import { NextRequest, NextResponse } from "next/server";

export async function handleGoogleOAuthLock(request: NextRequest) {
  // Only process Google OAuth callback requests
  if (!request.url.includes("/api/auth/callback/google")) {
    return NextResponse.next();
  }

  // Check if registration is disabled
  if (!isRegistrationEnabled()) {
    try {
      // Extract the authorization code from the URL
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      
      if (code) {
        // Exchange code for access token to get user profile
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/google`,
          }),
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Get user profile from Google
          const profileResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
          );
          
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            
            // Check if user exists in database
            const existingUser = await prisma.user.findUnique({
              where: { email: profile.email },
            });
            
            // If user doesn't exist, block the registration
            if (!existingUser) {
              // Redirect to signup page with error message
              const signupUrl = new URL("/auth/signup", request.url);
              signupUrl.searchParams.set("error", "registration_closed");
              return NextResponse.redirect(signupUrl);
            }
          }
        }
      }
    } catch (error) {
      // If any error occurs during verification, block by default
      console.error("Error in Google OAuth lock middleware:", error);
      const signupUrl = new URL("/auth/signup", request.url);
      signupUrl.searchParams.set("error", "registration_closed");
      return NextResponse.redirect(signupUrl);
    }
  }

  return NextResponse.next();
}
