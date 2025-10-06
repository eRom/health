import React from 'react'
import { NextIntlClientProvider } from 'next-intl'

// Mock messages pour Storybook
const messages = {
  auth: {
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: "Pas encore de compte ?",
    alreadyHaveAccount: 'Déjà un compte ?',
    loginError: 'Email ou mot de passe incorrect',
    signupError: "Erreur lors de l'inscription",
  },
  common: {
    loading: 'Chargement...',
    submit: 'Envoyer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
  },
}

export const NextIntlDecorator = (Story: React.ComponentType) => {
  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
      <Story />
    </NextIntlClientProvider>
  )
}
