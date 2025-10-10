'use client'

import { AdminLink } from "@/components/admin/admin-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface UserNavProps {
  user: { name: string; email: string };
  isAdmin?: boolean;
}

export function UserNav({ user, isAdmin = false }: UserNavProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <div className="flex items-center gap-4">
      <AdminLink isAdmin={isAdmin} />

      <Link
        href="/profile"
        className="text-sm transition-colors hover:text-primary cursor-pointer"
      >
        {user.name}
      </Link>

      <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {t("auth.signOut")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("auth.dialogSignout.title")}</DialogTitle>
            <DialogDescription>
              {t("auth.dialogSignout.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSignOutOpen(false)}>
              {t("auth.dialogSignout.cancel")}
            </Button>
            <Button onClick={handleSignOut}>{t("auth.signOut")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
