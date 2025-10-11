'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { Shield, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface UserNavProps {
  user: { name?: string | null; email?: string | null };
  isAdmin?: boolean;
  isHealthcareProvider?: boolean;
}

export function UserNav({
  user,
  isAdmin = false,
  isHealthcareProvider = false,
}: UserNavProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  // Générer les initiales à partir du nom
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user.name || "Utilisateur"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "Utilisateur"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t("auth.userMenu.myProfile")}</span>
          </Link>
        </DropdownMenuItem>
        {isHealthcareProvider && (
          <DropdownMenuItem asChild>
            <Link href="/healthcare" className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>{t("auth.userMenu.myPatients")}</span>
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/users" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>{t("auth.userMenu.administration")}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              {t("auth.signOut")}
            </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
