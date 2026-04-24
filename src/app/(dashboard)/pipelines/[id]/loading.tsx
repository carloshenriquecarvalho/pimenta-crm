import { Skeleton } from "@/components/ui/skeleton"

export default function KanbanLoading() {
  return (
    <div className="flex flex-col h-full -m-6">
      <div className="px-6 pt-5 pb-3 bg-white border-b space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex gap-4 overflow-x-auto p-4 flex-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-72 flex flex-col h-full gap-2">
            <div className="p-3 bg-white rounded-t-lg border border-b-0 flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex-1 border border-t-0 rounded-b-lg bg-gray-50 p-2 space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-white rounded-lg border p-3 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
