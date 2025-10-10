import { checkIsAdmin } from "@/app/actions/admin/check-is-admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { HeaderClient } from "./header-client";

export async function Header() {
  const incomingHeaders = headers();
  const session = await auth
    .api.getSession({ headers: incomingHeaders })
    .catch(() => null);
  const isAdmin = await checkIsAdmin(session);

  return <HeaderClient isAdmin={isAdmin} initialSession={session} />;
}
