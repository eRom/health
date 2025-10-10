'use client'

import { Link } from "@/i18n/routing"
import { Shield } from "lucide-react"
import { useTranslations } from "next-intl"

interface AdminLinkProps {
  isAdmin: boolean
}

export function AdminLink({ isAdmin }: AdminLinkProps) {
  const t = useTranslations()

  if (!isAdmin) return null

  return (
    <Link
      href="/admin/users"
      className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
    >
      <Shield className="h-4 w-4" />
      {t("admin.title")}
    </Link>
  )
}

