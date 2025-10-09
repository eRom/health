'use client'

import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Home, Mail, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            {/* Error Code */}
            <div className="mb-8">
              <h1 className="text-8xl font-bold text-muted-foreground/20">
                404
              </h1>
            </div>

            {/* Main Content */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Page introuvable
                </CardTitle>
                <CardDescription className="text-lg">
                  Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Suggestions */}
                <div className="text-left">
                  <h2 className="mb-4 font-semibold text-lg">
                    Que pouvez-vous faire ?
                  </h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Vérifiez l&apos;URL dans la barre d&apos;adresse
                    </li>
                    <li className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Retournez à la page d&apos;accueil
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contactez le support si le problème persiste
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button asChild size="lg">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Retour à l&apos;accueil
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/about">
                      <Mail className="mr-2 h-4 w-4" />
                      Contacter le support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Help */}
            <div className="text-sm text-muted-foreground">
              <p>
                Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, n&apos;hésitez pas à{" "}
                <Link 
                  href="/about" 
                  className="text-primary hover:underline"
                >
                  nous contacter
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}