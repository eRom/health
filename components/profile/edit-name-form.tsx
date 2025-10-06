'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateName } from '@/app/actions/update-profile'

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
})

type FormData = z.infer<typeof formSchema>

export function EditNameForm({ currentName, onSuccess }: { currentName: string; onSuccess?: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentName,
    },
  })

  async function onSubmit(data: FormData) {
    setError('')
    const result = await updateName(data)

    if (result.success) {
      setIsEditing(false)
      if (onSuccess) onSuccess()
      // Refresh the page to update the session
      window.location.reload()
    } else {
      setError(result.error || 'Une erreur est survenue')
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Nom</p>
          <p className="text-lg">{currentName}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Modifier
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false)
              form.reset()
            }}
            disabled={form.formState.isSubmitting}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}
