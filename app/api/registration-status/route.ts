import { isRegistrationEnabled } from "@/lib/registration-lock";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const enabled = isRegistrationEnabled();

    return NextResponse.json({
      enabled,
      message: enabled
        ? "Registrations are open"
        : "Registrations are temporarily closed",
    });
  } catch (error) {
    console.error("Error checking registration status:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
