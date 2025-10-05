import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
import { StructuredData, createWebPageSchema } from '@/components/seo/structured-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RGPD - Conformité et droits',
  description:
    'Conformité RGPD de Health In Cloud. Vos droits concernant vos données personnelles et de santé selon le règlement européen.',
}

export default function GDPRPage() {
  const schema = createWebPageSchema(
    'RGPD - Conformité et droits',
    'Conformité RGPD de Health In Cloud. Vos droits concernant vos données personnelles et de santé selon le règlement européen.',
    'https://healthincloud.app/fr/gdpr'
  )

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData data={schema} />
      <Header />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">Conformité RGPD</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="mb-6 text-muted-foreground">
                Health In Cloud s&apos;engage à respecter le Règlement Général sur la Protection des Données (RGPD).
              </p>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">1. Responsable du Traitement</h2>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2"><strong>Responsable :</strong> Health In Cloud</p>
                  <p className="mb-2"><strong>Email :</strong> dpo@healthincloud.app</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">2. Finalités du Traitement</h2>
                <p className="mb-4 text-muted-foreground">
                  Vos données sont traitées pour les finalités suivantes :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Gestion de votre compte utilisateur</li>
                  <li>Fourniture des services de rééducation</li>
                  <li>Suivi de votre progression thérapeutique</li>
                  <li>Communication avec votre équipe soignante</li>
                  <li>Amélioration de nos services</li>
                  <li>Respect de nos obligations légales</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">3. Bases Légales</h2>
                <p className="mb-4 text-muted-foreground">
                  Le traitement de vos données repose sur :
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 font-semibold">Consentement (Art. 6.1.a RGPD)</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour le traitement de vos données de santé, nous recueillons votre consentement
                      explicite et éclairé.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 font-semibold">Exécution du Contrat (Art. 6.1.b RGPD)</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour la fourniture des services de rééducation que vous avez souscrits.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 font-semibold">Intérêt Légitime (Art. 6.1.f RGPD)</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour l&apos;amélioration de nos services et la sécurité de la plateforme.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">4. Vos Droits RGPD</h2>
                <p className="mb-4 text-muted-foreground">
                  Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants :
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Droit d&apos;accès (Art. 15)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez obtenir une copie de toutes vos données personnelles.
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Droit de rectification (Art. 16)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez demander la correction de données inexactes ou incomplètes.
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Droit à l&apos;effacement (Art. 17)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez demander la suppression de vos données dans certaines conditions.
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Droit à la limitation (Art. 18)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez demander la limitation du traitement de vos données.
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Droit à la portabilité (Art. 20)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez recevoir vos données dans un format structuré et couramment utilisé.
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Droit d&apos;opposition (Art. 21)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">Retrait du consentement (Art. 7.3)</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez retirer votre consentement à tout moment.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">5. Exercer vos Droits</h2>
                <p className="mb-4 text-muted-foreground">
                  Pour exercer l&apos;un de ces droits, vous pouvez :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Envoyer un email à : <a href="mailto:dpo@healthincloud.app" className="text-primary hover:underline">dpo@healthincloud.app</a></li>
                  <li>Utiliser le formulaire de contact sur votre profil</li>
                </ul>
                <div className="rounded-lg border bg-primary/5 p-6">
                  <p className="mb-2 font-semibold">Délai de réponse :</p>
                  <p className="text-sm text-muted-foreground">
                    Nous nous engageons à vous répondre dans un délai maximum d&apos;un mois suivant
                    la réception de votre demande, conformément à l&apos;article 12.3 du RGPD.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">6. Sécurité des Données</h2>
                <p className="mb-4 text-muted-foreground">
                  Conformément à l&apos;article 32 du RGPD, nous mettons en œuvre les mesures techniques
                  et organisationnelles appropriées :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Chiffrement des données (en transit et au repos)</li>
                  <li>Authentification forte</li>
                  <li>Hébergement certifié HDS</li>
                  <li>Contrôle d&apos;accès strict</li>
                  <li>Journalisation des accès</li>
                  <li>Sauvegardes régulières</li>
                  <li>Tests de sécurité périodiques</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">7. Transferts de Données</h2>
                <p className="mb-4 text-muted-foreground">
                  Vos données sont hébergées au sein de l&apos;Union Européenne. Aucun transfert hors UE
                  n&apos;est effectué sans garanties appropriées conformément à l&apos;article 44 du RGPD.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">8. Réclamation</h2>
                <p className="mb-4 text-muted-foreground">
                  Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d&apos;introduire
                  une réclamation auprès de la CNIL :
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2"><strong>CNIL</strong></p>
                  <p className="mb-1 text-sm">3 Place de Fontenoy</p>
                  <p className="mb-1 text-sm">TSA 80715</p>
                  <p className="mb-1 text-sm">75334 PARIS CEDEX 07</p>
                  <p className="text-sm">Site : <a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a></p>
                </div>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">Délégué à la Protection des Données</h2>
                <p className="mb-2 text-muted-foreground">
                  Pour toute question relative à la protection de vos données :
                </p>
                <p className="text-muted-foreground">
                  Email : <a href="mailto:dpo@healthincloud.app" className="text-primary hover:underline">dpo@healthincloud.app</a>
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
