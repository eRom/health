import { useTranslations } from 'next-intl'
import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'

export default function AboutPage() {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">À propos de Health In Cloud</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Notre Mission</h2>
                <p className="mb-4 text-muted-foreground">
                  Health In Cloud est une plateforme web dédiée à la rééducation orthophonique et
                  neuropsychologique, développée en partenariat avec le département de Médecine Physique
                  et de Réadaptation (MPR) de Nantes.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Notre mission est de fournir aux patients en rééducation un accès permanent à des
                  exercices guidés, avec un suivi personnalisé et des retours instantanés, permettant
                  une pratique autonome entre les séances avec les thérapeutes.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Notre Approche</h2>
                <p className="mb-4 text-muted-foreground">
                  Nous croyons en une approche centrée sur le patient, combinant :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Des exercices validés scientifiquement</li>
                  <li>Une interface accessible et intuitive</li>
                  <li>Un suivi en temps réel des performances</li>
                  <li>Une collaboration étroite avec les professionnels de santé</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Nos Valeurs</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">Accessibilité</h3>
                    <p className="text-sm text-muted-foreground">
                      Une plateforme utilisable par tous, optimisée pour les personnes en situation de handicap.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">Sécurité</h3>
                    <p className="text-sm text-muted-foreground">
                      Protection maximale de vos données de santé, conforme RGPD.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">Innovation</h3>
                    <p className="text-sm text-muted-foreground">
                      Utilisation des dernières technologies pour améliorer l'expérience utilisateur.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">Collaboration</h3>
                    <p className="text-sm text-muted-foreground">
                      Travail étroit avec les professionnels de santé pour garantir la qualité.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Partenariat MPR Nantes</h2>
                <p className="mb-4 text-muted-foreground">
                  Health In Cloud est développé en étroite collaboration avec le département de Médecine
                  Physique et de Réadaptation du CHU de Nantes, garantissant une approche clinique
                  rigoureuse et adaptée aux besoins réels des patients.
                </p>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">Nous Contacter</h2>
                <p className="mb-4 text-muted-foreground">
                  Pour toute question ou suggestion, n'hésitez pas à nous contacter :
                </p>
                <p className="text-muted-foreground">
                  Email : <a href="mailto:contact@healthincloud.app" className="text-primary hover:underline">contact@healthincloud.app</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
