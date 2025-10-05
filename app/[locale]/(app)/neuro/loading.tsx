import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function NeuroLoading() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Skeleton className="mb-2 h-9 w-96" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Filtres */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Grille d'exercices */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader>
              <Skeleton className="mb-4 h-16 w-16" />
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="mb-4 h-12 w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
