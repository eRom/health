import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
import { StructuredData, createWebPageSchema } from '@/components/seo/structured-data'
import type { Metadata } from 'next'

// Optimize static generation
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate once per day

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Health In Cloud - Plateforme de rééducation orthophonique et neuropsychologique pour accompagner les patients en réadaptation.',
}

export default function AboutPage() {
  const schema = createWebPageSchema(
    'À propos de Health In Cloud',
    'Health In Cloud - Plateforme de rééducation orthophonique et neuropsychologique pour accompagner les patients en réadaptation.',
    'https://healthincloud.app/fr/about'
  )

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData data={schema} />
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
                  neuropsychologique, conçue pour accompagner les patients en réadaptation.
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
                  <li>Des exercices issus d&apos;une expérience personnelle de rééducation</li>
                  <li>Une interface accessible et intuitive</li>
                  <li>Un suivi en temps réel des performances</li>
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
                      Utilisation des dernières technologies pour améliorer l&apos;expérience utilisateur.
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

              <section className="mb-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center shadow-lg">
                <div className="mb-4 text-4xl">💙</div>
                <h2 className="mb-3 text-2xl font-bold tracking-tight">
                  Soutenez ce projet
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Ce projet est développé avec passion pour aider les patients en rééducation.
                  Si vous souhaitez soutenir son développement et partager mon parcours de renaissance
                  après un AVC, vous pouvez contribuer via Tipeee.
                </p>
                <a
                  href="https://fr.tipeee.com/rebondir-apres-lavc-ma-carriere-dans-la-tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <span>☕</span>
                  <span>Soutenir sur Tipeee</span>
                </a>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">Nous Contacter</h2>
                <p className="mb-4 text-muted-foreground">
                  Pour toute question ou suggestion, n&apos;hésitez pas à nous contacter :
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
