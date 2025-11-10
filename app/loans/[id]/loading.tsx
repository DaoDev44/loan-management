import { LoadingState } from '@/components/shared/loading-state'

export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingState text="Loading loan details..." size="lg" />
    </div>
  )
}
