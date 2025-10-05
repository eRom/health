import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">Politique de Confidentialité</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="mb-6 text-sm text-muted-foreground">
                Dernière mise à jour : Janvier 2025
              </p>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
                <p className="mb-4 text-muted-foreground">
                  Health In Cloud ("nous", "notre", "nos") s'engage à protéger la confidentialité
                  de vos données personnelles. Cette politique de confidentialité explique comment
                  nous collectons, utilisons et protégeons vos informations.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">2. Données Collectées</h2>
                <p className="mb-4 text-muted-foreground">
                  Nous collectons les données suivantes :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
                  <li><strong>Données de santé :</strong> résultats des exercices, progression thérapeutique</li>
                  <li><strong>Données techniques :</strong> adresse IP, type de navigateur, données de connexion</li>
                  <li><strong>Données d'utilisation :</strong> interactions avec la plateforme, temps passé sur les exercices</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">3. Utilisation des Données</h2>
                <p className="mb-4 text-muted-foreground">
                  Vos données sont utilisées pour :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Fournir les services de rééducation</li>
                  <li>Suivre votre progression thérapeutique</li>
                  <li>Améliorer nos services</li>
                  <li>Communiquer avec vous concernant votre compte</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">4. Base Légale du Traitement</h2>
                <p className="mb-4 text-muted-foreground">
                  Le traitement de vos données repose sur :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Votre consentement explicite pour les données de santé</li>
                  <li>L'exécution du contrat de service</li>
                  <li>Le respect de nos obligations légales</li>
                  <li>Notre intérêt légitime à améliorer nos services</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">5. Partage des Données</h2>
                <p className="mb-4 text-muted-foreground">
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Les professionnels de santé du département MPR de Nantes qui vous suivent</li>
                  <li>Nos prestataires techniques (hébergement sécurisé)</li>
                  <li>Les autorités compétentes en cas d'obligation légale</li>
                </ul>
                <p className="mb-4 text-muted-foreground">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">6. Sécurité des Données</h2>
                <p className="mb-4 text-muted-foreground">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
                  appropriées pour protéger vos données contre tout accès non autorisé, perte,
                  destruction ou altération :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Chiffrement des données en transit (HTTPS) et au repos</li>
                  <li>Authentification sécurisée</li>
                  <li>Hébergement sur des serveurs certifiés HDS (Hébergeur de Données de Santé)</li>
                  <li>Accès limité aux données par le personnel autorisé uniquement</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">7. Durée de Conservation</h2>
                <p className="mb-4 text-muted-foreground">
                  Vos données sont conservées :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Pendant la durée de votre suivi thérapeutique</li>
                  <li>20 ans après la dernière consultation (conformément à la réglementation sur les données de santé)</li>
                  <li>3 ans après la fin de la relation contractuelle pour les données non-médicales</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">8. Vos Droits</h2>
                <p className="mb-4 text-muted-foreground">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                  <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                  <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                </ul>
                <p className="mb-4 text-muted-foreground">
                  Pour exercer vos droits, contactez-nous à : <a href="mailto:dpo@healthincloud.app" className="text-primary hover:underline">dpo@healthincloud.app</a>
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">9. Cookies</h2>
                <p className="mb-4 text-muted-foreground">
                  Nous utilisons des cookies strictement nécessaires au fonctionnement du service
                  (authentification, préférences de langue). Aucun cookie de tracking ou publicitaire
                  n'est utilisé.
                </p>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
                <p className="mb-2 text-muted-foreground">
                  Pour toute question concernant cette politique de confidentialité :
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
