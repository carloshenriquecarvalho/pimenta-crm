import { Skeleton } from "@/components/ui/skeleton"

export default function ContactsLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="glass-panel p-6 rounded-lg border shadow-sm space-y-4">
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="border rounded-md">
          <div className="p-4 border-b">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-2 p-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
