import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const title = t('home.hero.title')
  const description = t('home.hero.description')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      title,
      description,
    },
  }
}

import {
  User,
  Stethoscope,
  Brain,
  Mic,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  Smartphone,
  Moon,
  Shield,
} from 'lucide-react'

export default function HomePage() {
  const t = useTranslations()

  // WebPage structured data for landing page
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('home.hero.title'),
    description: t('home.hero.description'),
    url: 'https://healthincloud.app',
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Health In Cloud',
      url: 'https://healthincloud.app',
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero overflow-hidden">
          <div className="container flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-8 px-4 py-12 text-center md:py-16">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  {t('home.hero.title')}
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {t('home.hero.description')}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="w-full text-base sm:w-56">
                  <Link href="/auth/signup">{t('home.hero.cta')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full text-base sm:w-56">
                  <Link href="/auth/login">{t('auth.signIn')}</Link>
                </Button>
              </div>

              <div className="w-full max-w-3xl mx-auto">
                <div className="rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-xl backdrop-blur md:p-8">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="flex flex-col items-center text-center">
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Brain className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <h3 className="mb-2 text-base font-semibold">
                        {t('home.hero.highlightGuidedTitle')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('home.hero.highlightGuidedDescription')}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mic className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <h3 className="mb-2 text-base font-semibold">
                        {t('home.hero.highlightFeedbackTitle')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('home.hero.highlightFeedbackDescription')}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Smartphone className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <h3 className="mb-2 text-base font-semibold">
                        {t('home.hero.highlightDevicesTitle')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('home.hero.highlightDevicesDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* Problems & Solutions Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Nous résolvons vos défis quotidiens
              </h2>
              <p className="text-lg text-muted-foreground">
                Notre plateforme répond aux besoins spécifiques des patients et des cliniciens
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Patients Card */}
              <div className="card-hover overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="border-b bg-[var(--color-bg-3)] p-6">
                  <h3 className="flex items-center gap-2 text-xl font-semibold">
                    <User className="h-6 w-6" aria-hidden="true" />
                    Pour les patients
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 text-sm font-semibold">Difficultés actuelles :</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Difficile de retenir les exercices prescrits</li>
                        <li>• Pas de feedback entre les séances</li>
                        <li>• Motivation limitée</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-primary">Notre solution :</h4>
                      <ul className="space-y-2 text-sm text-primary">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Accès permanent aux exercices guidés</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Feedback instantané sur les performances</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Encouragements motivationnels</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinicians Card */}
              <div className="card-hover overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="border-b bg-[var(--color-bg-3)] p-6">
                  <h3 className="flex items-center gap-2 text-xl font-semibold">
                    <Stethoscope className="h-6 w-6" aria-hidden="true" />
                    Pour les cliniciens
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 text-sm font-semibold">Difficultés actuelles :</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Aucune visibilité sur la pratique à domicile</li>
                        <li>• Difficile de quantifier les progrès</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-primary">Notre solution :</h4>
                      <ul className="space-y-2 text-sm text-primary">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Tableau de bord résumant l&apos;adhérence</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Tendances de performance et insights actionnables</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fonctionnalites" className="bg-[var(--color-bg-2)] py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Fonctionnalités clés
              </h2>
              <p className="text-lg text-muted-foreground">
                Une plateforme complète pour votre rééducation
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Target className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Exercices guidés 24/7</h3>
                <p className="text-sm text-muted-foreground">
                  Accès permanent à vos exercices prescrits avec guidage vocal et visuel
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Feedback instantané</h3>
                <p className="text-sm text-muted-foreground">
                  Retours immédiats sur vos performances pour progresser efficacement
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Suivi des progrès</h3>
                <p className="text-sm text-muted-foreground">
                  Visualisation claire de votre évolution avec graphiques et statistiques
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Smartphone className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Design mobile-first</h3>
                <p className="text-sm text-muted-foreground">
                  Interface optimisée pour tablettes et smartphones
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Moon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Mode sombre</h3>
                <p className="text-sm text-muted-foreground">
                  Thème sombre par défaut pour réduire la fatigue oculaire
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Conformité RGPD</h3>
                <p className="text-sm text-muted-foreground">
                  Protection maximale de vos données de santé
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Ils nous font confiance
              </h2>
              <p className="text-lg text-muted-foreground">Témoignages de nos utilisateurs</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Marie Persona */}
              <div className="rounded-xl border bg-card p-8 shadow-sm">
                <div className="mb-6 text-center text-6xl">👩‍🦳</div>
                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-semibold">Marie, 48 ans</h3>
                  <p className="mb-1 text-sm font-medium text-primary">Patiente en rééducation</p>
                  <p className="text-sm text-muted-foreground">
                    Post-AVC ischémique avec troubles cognitifs et de la parole
                  </p>
                </div>
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  &ldquo;Je veux continuer à pratiquer à la maison comme je le fais avec mon thérapeute et
                  voir si je progresse.&rdquo;
                </blockquote>
              </div>

              {/* Dr. Typhaine Persona */}
              <div className="rounded-xl border bg-card p-8 shadow-sm">
                <div className="mb-6 text-center text-6xl">👩‍⚕️</div>
                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-semibold">Dr. Typhaine, 43 ans</h3>
                  <p className="mb-1 text-sm font-medium text-primary">Orthophoniste</p>
                  <p className="text-sm text-muted-foreground">
                    Clinicienne en médecine de réadaptation, 20-30 patients actifs
                  </p>
                </div>
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  &ldquo;J&apos;ai besoin de visibilité sur la pratique à domicile de mes patients pour ajuster
                  mes recommandations de manière proactive.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* User Journey Section */}
        <section className="bg-[var(--color-bg-5)] py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Votre parcours en 4 étapes
              </h2>
              <p className="text-lg text-muted-foreground">
                Un accompagnement personnalisé de l&apos;inscription au suivi
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Découverte et inscription</h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez la plateforme et créez votre compte sécurisé
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Premier exercice</h3>
                  <p className="text-sm text-muted-foreground">
                    Complétez votre premier exercice et recevez un feedback immédiat
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Entraînement quotidien</h3>
                  <p className="text-sm text-muted-foreground">
                    Réalisez 2-3 exercices par session avec suivi des performances
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  4
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Suivi des progrès</h3>
                  <p className="text-sm text-muted-foreground">
                    Consultez vos statistiques détaillées et exportez vos rapports PDF
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiators Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Technologie & Accessibilité
              </h2>
              <p className="text-lg text-muted-foreground">Une plateforme moderne et inclusive</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <div className="text-center">
                <div className="mx-auto mb-3 text-4xl">📱</div>
                <h3 className="mb-1 text-sm font-semibold">Mobile-first</h3>
                <p className="text-xs text-muted-foreground">Expérience responsive optimisée</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 text-4xl">♿</div>
                <h3 className="mb-1 text-sm font-semibold">WCAG 2.1 AA</h3>
                <p className="text-xs text-muted-foreground">Accessibilité garantie</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 text-4xl">📶</div>
                <h3 className="mb-1 text-sm font-semibold">PWA Hors ligne</h3>
                <p className="text-xs text-muted-foreground">Utilisation sans connexion</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 text-4xl">🌐</div>
                <h3 className="mb-1 text-sm font-semibold">Bilingue FR/EN</h3>
                <p className="text-xs text-muted-foreground">Changement instantané</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 text-4xl">🔒</div>
                <h3 className="mb-1 text-sm font-semibold">RGPD</h3>
                <p className="text-xs text-muted-foreground">Données de santé protégées</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 text-4xl">⚡</div>
                <h3 className="mb-1 text-sm font-semibold">Performance</h3>
                <p className="text-xs text-muted-foreground">≥90/100 Lighthouse</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="gradient-cta py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Prêt à commencer votre rééducation ?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Rejoignez dès maintenant les patients qui font confiance à Health In Cloud pour leur rééducation
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="w-full text-base sm:w-56">
                  <Link href="/auth/signup">Créer mon compte</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full text-base sm:w-56">
                  <Link href="/about">En savoir plus</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                    Toujours à portée de main
                  </h2>
                  <p className="mb-6 text-lg text-muted-foreground">
                    Accédez à vos exercices de rééducation où que vous soyez. Notre plateforme est
                    optimisée pour mobile et tablette, vous offrant une expérience fluide et intuitive.
                  </p>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                        <path d="m9 11 3 3L22 4"></path>
                      </svg>
                      <span className="text-muted-foreground">
                        Interface responsive adaptée à tous les écrans
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                        <path d="m9 11 3 3L22 4"></path>
                      </svg>
                      <span className="text-muted-foreground">
                        Mode hors ligne pour pratiquer sans connexion
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                        <path d="m9 11 3 3L22 4"></path>
                      </svg>
                      <span className="text-muted-foreground">
                        Synchronisation automatique de vos progrès
                      </span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    Scannez le QR code pour accéder directement à la plateforme depuis votre mobile
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="rounded-xl bg-white p-4">
                    <Image
                      src="/qr-code.png"
                      alt="QR Code pour accéder à Health In Cloud"
                      width={256}
                      height={256}
                      className="h-auto w-64"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tipeee Support Section */}
        <section className="py-12 md:py-16">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center shadow-lg">
                <div className="mb-4 text-4xl">💙</div>
                <h2 className="mb-3 text-2xl font-bold tracking-tight">
                  Soutenez ce projet
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Ce projet est développé avec passion pour aider les patients en rééducation.
                  Si vous souhaitez soutenir son développement et partager mon parcours de renaissance
                  après un AVC, vous pouvez contribuer via Tipeee.
                </p>
                <Button asChild size="lg" className="gap-2">
                  <a
                    href="https://fr.tipeee.com/rebondir-apres-lavc-ma-carriere-dans-la-tech"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>☕</span>
                    <span>Soutenir sur Tipeee</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
