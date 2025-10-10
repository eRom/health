"use client";

import { Footer } from "@/components/navigation/footer";
import { HeaderClient } from "@/components/navigation/header-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Home, Mail, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderClient isAdmin={false} initialSession={null} />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            {/* Error Code */}
            <div className="mb-8">
              <h1 className="text-8xl font-bold text-muted-foreground/20">
                500
              </h1>
            </div>

            {/* Main Content */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-destructive">
                  Erreur du serveur
                </CardTitle>
                <CardDescription className="text-lg">
                  Une erreur inattendue s&apos;est produite. Notre équipe a été notifiée et travaille à résoudre le problème.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === "development" && (
                  <div className="rounded-lg bg-muted p-4 text-left">
                    <h3 className="mb-2 font-semibold">Error Details (Development):</h3>
                    <pre className="text-sm text-muted-foreground">
                      {error.message}
                      {error.digest && `\nDigest: ${error.digest}`}
                    </pre>
                  </div>
                )}

                {/* Suggestions */}
                <div className="text-left">
                  <h2 className="mb-4 font-semibold text-lg">
                    Que pouvez-vous faire ?
                  </h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Actualisez la page dans quelques minutes
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
                  <Button onClick={reset} size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualiser
                  </Button>
                  
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Retour à l&apos;accueil
                    </Link>
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
                Si le problème persiste, notre équipe technique a été automatiquement notifiée.
                Vous pouvez également{" "}
                <Link 
                  href="/about" 
                  className="text-primary hover:underline"
                >
                  nous contacter directement
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
