import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  emoji?: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mb-4">
        {Icon && (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {emoji && (
          <div className="text-6xl" aria-hidden="true">
            {emoji}
          </div>
        )}
      </div>

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">{description}</p>

      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
