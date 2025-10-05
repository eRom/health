import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">Mentions Légales</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">1. Éditeur du Site</h2>
                <p className="mb-4 text-muted-foreground">
                  Le site Health In Cloud est édité par :
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2"><strong>Raison sociale :</strong> Health In Cloud</p>
                  <p className="mb-2"><strong>Forme juridique :</strong> [À compléter]</p>
                  <p className="mb-2"><strong>Siège social :</strong> [À compléter]</p>
                  <p className="mb-2"><strong>Email :</strong> contact@healthincloud.app</p>
                  <p className="mb-2"><strong>SIRET :</strong> [À compléter]</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">2. Directeur de Publication</h2>
                <p className="mb-4 text-muted-foreground">
                  Le directeur de publication est : [À compléter]
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">3. Hébergement</h2>
                <p className="mb-4 text-muted-foreground">
                  Le site est hébergé par :
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2"><strong>Hébergeur :</strong> Vercel Inc.</p>
                  <p className="mb-2"><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                  <p className="mb-2"><strong>Site web :</strong> <a href="https://vercel.com" className="text-primary hover:underline">vercel.com</a></p>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Base de données hébergée par :
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2"><strong>Hébergeur :</strong> Neon (certifié HDS pour données de santé)</p>
                  <p className="mb-2"><strong>Site web :</strong> <a href="https://neon.tech" className="text-primary hover:underline">neon.tech</a></p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">4. Propriété Intellectuelle</h2>
                <p className="mb-4 text-muted-foreground">
                  L'ensemble du contenu de ce site (textes, images, vidéos, structure, design)
                  est protégé par le droit d'auteur et est la propriété exclusive de Health In Cloud,
                  sauf mention contraire.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Toute reproduction, représentation, modification, publication, adaptation de tout
                  ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est
                  interdite, sauf autorisation écrite préalable.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">5. Protection des Données</h2>
                <p className="mb-4 text-muted-foreground">
                  Les données à caractère personnel collectées sur ce site sont traitées conformément
                  au Règlement Général sur la Protection des Données (RGPD).
                </p>
                <p className="mb-4 text-muted-foreground">
                  Pour plus d'informations, consultez notre <a href="/privacy" className="text-primary hover:underline">Politique de Confidentialité</a>.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">6. Responsabilité</h2>
                <p className="mb-4 text-muted-foreground">
                  Health In Cloud met tout en œuvre pour offrir aux utilisateurs des informations
                  et outils disponibles et vérifiés. Toutefois, nous ne pouvons être tenus responsables
                  des erreurs, d'une absence de disponibilité des informations et/ou de la présence de virus.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Les exercices proposés ne remplacent pas un suivi médical professionnel et doivent
                  être utilisés dans le cadre d'un protocole de soins supervisé par un professionnel
                  de santé.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">7. Liens Hypertextes</h2>
                <p className="mb-4 text-muted-foreground">
                  Le site peut contenir des liens vers d'autres sites. Health In Cloud ne saurait
                  être responsable du contenu de ces sites externes.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">8. Droit Applicable</h2>
                <p className="mb-4 text-muted-foreground">
                  Les présentes mentions légales sont soumises au droit français. En cas de litige,
                  les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
                <p className="mb-2 text-muted-foreground">
                  Pour toute question concernant les mentions légales :
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
