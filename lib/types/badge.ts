import type { BadgeType } from '@prisma/client'

export interface BadgeDefinition {
  type: BadgeType
  emoji: string
  name: string
  description: string
  message: string
  category: 'welcome' | 'first' | 'streak' | 'volume'
  threshold?: number
}

export interface BadgeProgress {
  current: number
  target: number
  percentage: number
  remaining: number
}

export interface UserBadgeWithProgress {
  id: string
  badgeType: BadgeType
  earnedAt: Date
  definition: BadgeDefinition
  progress?: BadgeProgress
}

export interface NextBadge {
  definition: BadgeDefinition
  progress: BadgeProgress
}

export interface BadgeStats {
  totalEarned: number
  totalAvailable: number
  completionPercentage: number
  nextBadges: NextBadge[]
}

// Badge definitions based on specifications
export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  WELCOME: {
    type: 'WELCOME',
    emoji: '🎉',
    name: 'Bienvenue dans l\'aventure !',
    description: 'Tu as franchi le premier pas vers ta récupération',
    message: '🎉 Bienvenue dans Health In Cloud ! Ton parcours de récupération commence maintenant. Chaque petit pas compte !',
    category: 'welcome'
  },
  FIRST_EXERCISE: {
    type: 'FIRST_EXERCISE',
    emoji: '🌱',
    name: 'Première Graine Plantée',
    description: 'Tu as complété ton tout premier exercice !',
    message: '🌱 Félicitations ! Tu viens de planter la première graine de ta récupération. Cette graine va grandir avec chaque exercice !',
    category: 'first'
  },
  STREAK_3: {
    type: 'STREAK_3',
    emoji: '🔥',
    name: 'Première Étincelle',
    description: '3 jours consécutifs',
    message: '🔥 Première étincelle allumée ! La constance commence à payer.',
    category: 'streak',
    threshold: 3
  },
  STREAK_7: {
    type: 'STREAK_7',
    emoji: '⚡',
    name: 'Électrisant',
    description: '7 jours consécutifs (1 semaine)',
    message: '⚡ Une semaine complète ! Tu es sur la bonne voie.',
    category: 'streak',
    threshold: 7
  },
  STREAK_14: {
    type: 'STREAK_14',
    emoji: '💎',
    name: 'Diamant',
    description: '14 jours consécutifs (2 semaines)',
    message: '💎 Deux semaines de régularité ! Ta détermination est admirable.',
    category: 'streak',
    threshold: 14
  },
  STREAK_30: {
    type: 'STREAK_30',
    emoji: '🏆',
    name: 'Champion',
    description: '30 jours consécutifs (1 mois)',
    message: '🏆 Un mois complet ! Tu es un vrai champion de la rééducation.',
    category: 'streak',
    threshold: 30
  },
  STREAK_60: {
    type: 'STREAK_60',
    emoji: '👑',
    name: 'Légendaire',
    description: '60 jours consécutifs (2 mois)',
    message: '👑 Deux mois de constance ! Tu rejoins les légendes.',
    category: 'streak',
    threshold: 60
  },
  STREAK_100: {
    type: 'STREAK_100',
    emoji: '🌟',
    name: 'Maître Absolu',
    description: '100 jours consécutifs',
    message: '🌟 100 jours ! Tu es devenu un maître de la rééducation.',
    category: 'streak',
    threshold: 100
  },
  VOLUME_10: {
    type: 'VOLUME_10',
    emoji: '🎯',
    name: 'Premier Pas',
    description: '10 exercices complétés',
    message: '🎯 Tes premiers pas sont franchis ! Continue sur cette lancée.',
    category: 'volume',
    threshold: 10
  },
  VOLUME_25: {
    type: 'VOLUME_25',
    emoji: '🚀',
    name: 'Décollage',
    description: '25 exercices complétés',
    message: '🚀 Tu décolles ! Ton cerveau te remercie déjà.',
    category: 'volume',
    threshold: 25
  },
  VOLUME_50: {
    type: 'VOLUME_50',
    emoji: '⭐',
    name: 'Étoile Montante',
    description: '50 exercices complétés',
    message: '⭐ Tu brilles de plus en plus ! Ton engagement est remarquable.',
    category: 'volume',
    threshold: 50
  },
  VOLUME_100: {
    type: 'VOLUME_100',
    emoji: '🎖️',
    name: 'Soldat',
    description: '100 exercices complétés',
    message: '🎖️ Cent exercices ! Tu as la discipline d\'un soldat.',
    category: 'volume',
    threshold: 100
  },
  VOLUME_250: {
    type: 'VOLUME_250',
    emoji: '🏅',
    name: 'Expert',
    description: '250 exercices complétés',
    message: '🏅 Tu es devenu un expert ! Ton savoir-faire s\'affine.',
    category: 'volume',
    threshold: 250
  },
  VOLUME_500: {
    type: 'VOLUME_500',
    emoji: '🥇',
    name: 'Grand Maître',
    description: '500 exercices complétés',
    message: '🥇 Grand Maître confirmé ! Ton dévouement est exemplaire.',
    category: 'volume',
    threshold: 500
  },
  VOLUME_1000: {
    type: 'VOLUME_1000',
    emoji: '♦️',
    name: 'Diamant Éternel',
    description: '1000 exercices complétés',
    message: '♦️ Mille exercices ! Tu es une légende vivante de la rééducation.',
    category: 'volume',
    threshold: 1000
  }
}

export function getBadgeDefinition(type: BadgeType): BadgeDefinition {
  return BADGE_DEFINITIONS[type]
}

export function getAllBadgeDefinitions(): BadgeDefinition[] {
  return Object.values(BADGE_DEFINITIONS)
}

export function getBadgesByCategory(category: BadgeDefinition['category']): BadgeDefinition[] {
  return getAllBadgeDefinitions().filter(badge => badge.category === category)
}

export function getNextBadgeInCategory(
  category: BadgeDefinition['category'],
  currentValue: number
): BadgeDefinition | null {
  const badges = getBadgesByCategory(category)
    .filter(badge => badge.threshold && badge.threshold > currentValue)
    .sort((a, b) => (a.threshold || 0) - (b.threshold || 0))
  
  return badges[0] || null
}

export function calculateProgress(current: number, target: number): BadgeProgress {
  const percentage = Math.min((current / target) * 100, 100)
  const remaining = Math.max(target - current, 0)
  
  return {
    current,
    target,
    percentage,
    remaining
  }
}
