import { AdminActionState } from "@/components/admin-action-state"
import { Panel } from "@/components/admin-panel"
import type { EventState, Session } from "@/lib/types"

export function currentSessionActionId(sessionId: string | null): string {
  return sessionId === null ? "current:auto" : `current:${sessionId}`
}

export function AdminOverridePanel({
  eventState,
  qnaSessions,
  activeAction,
  completedAction,
  overrideMessage,
  onSetCurrentSession,
}: {
  readonly eventState: EventState
  readonly qnaSessions: readonly Session[]
  readonly activeAction: string | null
  readonly completedAction: string | null
  readonly overrideMessage: string | null
  readonly onSetCurrentSession: (sessionId: string | null) => void
}) {
  return (
    <Panel title="운영 제어 · 현재 질문 받는 방" tone="control">
      <div className="space-y-2">
        <p className="rounded-md bg-white/70 px-3 py-2 text-xs font-bold leading-relaxed text-cyan-950">
          참가자 안내와 띄우기 화면에 바로 반영됩니다.
        </p>
        <OverrideButton
          actionId={currentSessionActionId(null)}
          isActive={eventState.currentSessionId === null}
          activeAction={activeAction}
          completedAction={completedAction}
          onClick={() => onSetCurrentSession(null)}
        >
          자동/없음
        </OverrideButton>
        {qnaSessions.map((session) => (
          <OverrideButton
            key={session.id}
            actionId={currentSessionActionId(session.id)}
            isActive={eventState.currentSessionId === session.id}
            activeAction={activeAction}
            completedAction={completedAction}
            onClick={() => onSetCurrentSession(session.id)}
          >
            {session.speaker ?? session.title}
          </OverrideButton>
        ))}
        {overrideMessage === null ? null : (
          <p className="pt-1 text-xs font-bold text-zinc-500" aria-live="polite">
            {overrideMessage}
          </p>
        )}
      </div>
    </Panel>
  )
}

function OverrideButton({
  actionId,
  isActive,
  activeAction,
  completedAction,
  children,
  onClick,
}: {
  readonly actionId: string
  readonly isActive: boolean
  readonly activeAction: string | null
  readonly completedAction: string | null
  readonly children: React.ReactNode
  readonly onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={activeAction === actionId}
      className={`admin-button inline-flex items-center justify-between gap-2 text-left ${isActive ? "admin-button-active" : "admin-button-control"}`}
    >
      <span>{children}</span>
      <AdminActionState actionId={actionId} activeAction={activeAction} completedAction={completedAction} />
    </button>
  )
}
