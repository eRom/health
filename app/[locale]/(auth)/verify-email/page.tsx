'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Vérifiez votre email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Nous avons envoyé un lien de vérification à votre adresse email
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email de vérification envoyé</CardTitle>
            <CardDescription>
              Consultez votre boîte de réception et cliquez sur le lien pour activer votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Si vous ne recevez pas l'email :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Vérifiez vos spams/courriers indésirables</li>
                <li>Attendez quelques minutes</li>
                <li>Vérifiez que l'adresse email est correcte</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  Continuer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}