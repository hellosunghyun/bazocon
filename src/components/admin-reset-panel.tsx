import { Trash2 } from "lucide-react"
import { AdminActionState } from "@/components/admin-action-state"
import { Panel } from "@/components/admin-panel"
import type { SessionSnapshot } from "@/lib/types"

export const RESET_QUESTIONS_ACTION_ID = "reset:questions"

export function AdminResetPanel({
  snapshot,
  activeAction,
  completedAction,
  resetMessage,
  onReset,
}: {
  readonly snapshot: SessionSnapshot | null
  readonly activeAction: string | null
  readonly completedAction: string | null
  readonly resetMessage: string | null
  readonly onReset: () => void
}) {
  return (
    <Panel title="질문 초기화">
      <button
        type="button"
        onClick={onReset}
        disabled={activeAction === RESET_QUESTIONS_ACTION_ID || snapshot === null}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <AdminActionState
          actionId={RESET_QUESTIONS_ACTION_ID}
          activeAction={activeAction}
          completedAction={completedAction}
        />
        <Trash2 className="h-4 w-4" />
        선택한 세션 질문 초기화
      </button>
      {resetMessage === null ? null : (
        <p className="mt-2 text-xs font-bold text-zinc-500" aria-live="polite">
          {resetMessage}
        </p>
      )}
    </Panel>
  )
}
