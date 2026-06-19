import { Check, LoaderCircle } from "lucide-react"

export function AdminActionState({
  actionId,
  activeAction,
  completedAction,
}: {
  readonly actionId: string
  readonly activeAction: string | null
  readonly completedAction: string | null
}) {
  if (activeAction === actionId) {
    return <LoaderCircle className="h-4 w-4 animate-spin" />
  }
  if (completedAction === actionId) {
    return <Check className="h-4 w-4 text-emerald-600" />
  }
  return null
}
