import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const appT = useTranslations("app");

  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          {/* Platform Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">
              {t("platform.title")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#fonctionnalites"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("platform.features")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("platform.dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("platform.about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("legal.title")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("legal.legal")}
                </Link>
              </li>
              <li>
                <Link
                  href="/gdpr"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("legal.gdpr")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("contact.title")}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@healthincloud.app"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("contact.email")}
                </a>
              </li>
              <li>
                <a
                  href="https://healthincloud.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("contact.website")}
                </a>
              </li>
              <li>
                <Link
                  href="/thanks"
                  className="text-sm text-primary font-medium transition-colors hover:text-primary/80 flex items-center gap-1"
                >
                  ♥ {t("contact.thanks")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { appTitle: appT("title") })}
          </p>
        </div>
      </div>
    </footer>
  );
}
