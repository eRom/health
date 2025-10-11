'use client'

import { invitePatient } from '@/app/actions/healthcare/invite-patient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function InvitePatientForm() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientEmail: '',
    customMessage: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientEmail.trim()) {
      toast.error('L\'email du patient est requis')
      return
    }

    setIsLoading(true)
    
    try {
      await invitePatient({
        patientEmail: formData.patientEmail.trim(),
        customMessage: formData.customMessage.trim() || undefined
      })
      
      toast.success('Invitation envoyée avec succès')
      setFormData({ patientEmail: '', customMessage: '' })
      // Redirection vers la page des patients après succès
      router.push(`/${locale}/healthcare`)
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors de l\'envoi de l\'invitation'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter un patient</CardTitle>
        <CardDescription>
          Envoyez une invitation à un patient pour l&apos;associer à votre suivi.
          Le patient recevra un email avec un lien pour accepter votre invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2 space-y-4">
            <Label htmlFor="patientEmail">
              Email du patient *
            </Label>
            <Input
              id="patientEmail"
              type="email"
              placeholder="patient@exemple.fr"
              value={formData.patientEmail}
              onChange={handleInputChange('patientEmail')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col space-y-4 gap-2 pt-4">
            <Label htmlFor="customMessage">
              Message personnalisé (optionnel)
            </Label>
            <Textarea
              id="customMessage"
              placeholder="Ajoutez un message personnalisé pour accompagner votre invitation..."
              value={formData.customMessage}
              onChange={handleInputChange('customMessage')}
              disabled={isLoading}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground pb-4">
              {formData.customMessage.length}/500 caractères
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.patientEmail.trim()}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          </Button>
        </form>

       
      </CardContent>
    </Card>
  )
}
