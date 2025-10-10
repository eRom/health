import { checkIsAdmin } from "@/app/actions/admin/check-is-admin";
import { HeaderClient } from "./header-client";

export async function Header() {
  const isAdmin = await checkIsAdmin();

  return <HeaderClient isAdmin={isAdmin} />;
}
