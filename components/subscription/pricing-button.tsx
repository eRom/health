'use client'

import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

interface PricingButtonProps {
  plan?: 'monthly' | 'yearly'
  children: React.ReactNode
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function PricingButton({ children, className, size }: PricingButtonProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const handleClick = () => {
    // Redirect to subscription page where the user can complete the purchase
    router.push(`/${locale}/subscription`)
  }

  return (
    <Button
      onClick={handleClick}
      className={cn("cursor-pointer", className)}
      size={size}
      disabled
    >
      {children}
    </Button>
  );
}
