import {
  checkIsAdmin,
  checkIsHealthcareProvider,
} from "@/app/actions/admin/check-is-admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { HeaderClient } from "./header-client";

export async function Header() {
  const incomingHeaders = await headers();
  const session = await auth.api
    .getSession({ headers: incomingHeaders })
    .catch(() => null);
  const isAdmin = await checkIsAdmin(session);
  const isHealthcareProvider = await checkIsHealthcareProvider(session);

  return (
    <HeaderClient
      isAdmin={isAdmin}
      isHealthcareProvider={isHealthcareProvider}
      initialSession={session}
    />
  );
}
