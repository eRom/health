'use client'

import { UserNav } from "@/components/auth/user-nav";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

type SessionPayload = {
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    locale?: string | null;
    role?: string | null;
  };
} | null;

interface HeaderClientProps {
  isAdmin: boolean;
  isHealthcareProvider: boolean;
  initialSession: SessionPayload;
}

export function HeaderClient({
  isAdmin,
  isHealthcareProvider,
  initialSession,
}: HeaderClientProps) {
  const t = useTranslations();
  const { data: liveSession } = authClient.useSession();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!initialSession) {
      return;
    }

    const sessionAtom = authClient.$store?.atoms?.session;

    if (!sessionAtom) {
      return;
    }

    const currentValue = sessionAtom.get();

    if (!currentValue?.data) {
      sessionAtom.set({
        ...currentValue,
        data: initialSession,
        error: null,
        isPending: false,
        isRefetching: false,
      });
    }
  }, [initialSession]);

  const session = hasHydrated
    ? (liveSession ?? initialSession ?? null)
    : (initialSession ?? null);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile menu */}
        <MobileNav
          isAuthenticated={!!session?.user}
          userName={session?.user?.name ?? undefined}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.svg"
            alt="Health In Cloud"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl text-primary font-semibold tracking-tight">
            Health In Cloud
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {session?.user && (
            <>
              {!isHealthcareProvider && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t("navigation.dashboard")}
                </Link>
              )}

              {(isHealthcareProvider || isAdmin) && (
                <Link
                  href="/healthcare"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t("navigation.healthcare")}
                </Link>
              )}

              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      {t("navigation.exercises")}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[250px] gap-3 p-4 md:w-[250px] md:grid-cols-1">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/neuro"
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {t("navigation.neuro")}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug opacity-70">
                                Exercices cognitifs et mémoire
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/ortho"
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {t("navigation.ortho")}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug opacity-70">
                                Rééducation du langage
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/kine"
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {t("navigation.kine")}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug opacity-70">
                                Rééducation motrice
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/ergo"
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {t("navigation.ergo")}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug opacity-70">
                                Autonomie et activités
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </>
          )}

          <LanguageSwitcher />

          {session?.user ? (
            <UserNav
              user={session.user}
              isAdmin={isAdmin}
              isHealthcareProvider={isHealthcareProvider}
            />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">{t("auth.signIn")}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
