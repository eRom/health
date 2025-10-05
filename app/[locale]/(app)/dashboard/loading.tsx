import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="mb-8 h-10 w-64" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Skeleton className="mb-4 h-20 w-20 rounded-full" />
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Skeleton className="mb-4 h-20 w-20 rounded-full" />
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="mb-6 h-4 w-64" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
