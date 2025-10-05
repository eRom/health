import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
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

  return (
    <div className="flex min-h-screen flex-col">
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
                        <Brain className="h-6 w-6" />
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
                        <Mic className="h-6 w-6" />
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
                        <Smartphone className="h-6 w-6" />
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
                    <User className="h-6 w-6" />
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
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>Accès permanent aux exercices guidés</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>Feedback instantané sur les performances</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
                    <Stethoscope className="h-6 w-6" />
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
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>Tableau de bord résumant l'adhérence</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
        <section className="bg-[var(--color-bg-2)] py-16 md:py-24">
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
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Exercices guidés 24/7</h3>
                <p className="text-sm text-muted-foreground">
                  Accès permanent à vos exercices prescrits avec guidage vocal et visuel
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Feedback instantané</h3>
                <p className="text-sm text-muted-foreground">
                  Retours immédiats sur vos performances pour progresser efficacement
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Suivi des progrès</h3>
                <p className="text-sm text-muted-foreground">
                  Visualisation claire de votre évolution avec graphiques et statistiques
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Design mobile-first</h3>
                <p className="text-sm text-muted-foreground">
                  Interface optimisée pour tablettes et smartphones
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Moon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Mode sombre</h3>
                <p className="text-sm text-muted-foreground">
                  Thème sombre par défaut pour réduire la fatigue oculaire
                </p>
              </div>

              <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
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
                  "Je veux continuer à pratiquer à la maison comme je le fais avec mon thérapeute et
                  voir si je progresse."
                </blockquote>
              </div>

              {/* Dr. Typhaine Persona */}
              <div className="rounded-xl border bg-card p-8 shadow-sm">
                <div className="mb-6 text-center text-6xl">👩‍⚕️</div>
                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-semibold">Dr. Typhaine, 43 ans</h3>
                  <p className="mb-1 text-sm font-medium text-primary">Orthophoniste</p>
                  <p className="text-sm text-muted-foreground">
                    Clinicienne au MPR de Nantes, 20-30 patients actifs
                  </p>
                </div>
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  "J'ai besoin de visibilité sur la pratique à domicile de mes patients pour ajuster
                  mes recommandations de manière proactive."
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
                Un accompagnement personnalisé de l'inscription au suivi
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
                Rejoignez dès maintenant les patients du département MPR de Nantes qui font
                confiance à Health In Cloud
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="w-full text-base sm:w-56">
                  <Link href="/auth/signup">Créer mon compte</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full text-base sm:w-56">
                  <Link href="#apropos">En savoir plus</Link>
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
