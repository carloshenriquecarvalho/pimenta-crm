import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineLoading() {
  return (
    <div className="flex flex-col h-full -m-6">
      <div className="px-6 pt-5 pb-3 bg-background border-b">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex gap-3 items-center py-3 px-4 bg-background border-b">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="flex-1 overflow-auto p-4 flex gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-shrink-0 w-72 flex flex-col h-full">
            <div className="flex items-center justify-between p-3 bg-card rounded-t-lg border border-b-0">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex-1 border border-t-0 rounded-b-lg bg-background/50 p-2 space-y-2">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
              {i % 2 === 0 && <Skeleton className="h-28 w-full rounded-lg" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
