import { Skeleton } from '@/components/clay/ui'
export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pt-12 md:px-10">
      <Skeleton className="mx-auto h-9 w-48" />
      <Skeleton className="mx-auto h-16 w-3/4" />
      <Skeleton className="mx-auto h-5 w-1/2" />
      <div className="grid gap-6 pt-8 md:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </main>
  )
}
