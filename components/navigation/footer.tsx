import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export function Footer() {
  const t = useTranslations()

  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          {/* Platform Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Plateforme</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#fonctionnalites"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Légal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/gdpr"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  RGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@healthincloud.app"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  contact@healthincloud.app
                </a>
              </li>
              <li>
                <a
                  href="https://healthincloud.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  healthincloud.app
                </a>
              </li>
              <li>
                <Link
                  href="/thanks"
                  className="text-sm text-primary font-medium transition-colors hover:text-primary/80 flex items-center gap-1"
                >
                  ♥ {t('thanks.title')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 {t('app.title')}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
