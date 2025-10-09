import { z } from 'zod'

// Zod schemas for authentication data validation

export const SignupSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  healthDataConsent: z.boolean().refine(
    (val) => val === true,
    "Vous devez accepter le traitement de vos données de santé"
  ),
})

export type SignupData = z.infer<typeof SignupSchema>
