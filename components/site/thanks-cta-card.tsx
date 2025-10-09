'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { ArrowRight, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function ThanksCTACard() {
  const t = useTranslations("pageThanks.cta");

  return (
    <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 transition-all hover:shadow-xl group">
      <CardContent className="p-0">
        <Link href="/thanks" className="block">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all shadow-lg">
                <Image
                  src="/avatar-romain.jpg"
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
                <Heart className="h-4 w-4 fill-current" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {t('title')}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {t('subtitle')}
              </p>
              <Button variant="default" className="group-hover:scale-105 transition-transform">
                {t('button')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
