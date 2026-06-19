import { CheckCircle2, Eye, EyeOff, Pin, RotateCcw } from "lucide-react"
import { motion } from "motion/react"
import { AdminActionState } from "@/components/admin-action-state"
import type { Question, QuestionStatus } from "@/lib/types"

export function questionPinActionId(questionId: string): string {
  return `pin:${questionId}`
}

export function questionStatusActionId(questionId: string, intent: string): string {
  return `status:${questionId}:${intent}`
}

export function AdminQuestion({
  question,
  activeAction,
  completedAction,
  onPin,
  onStatus,
}: {
  readonly question: Question
  readonly activeAction: string | null
  readonly completedAction: string | null
  readonly onPin: (question: Question) => void
  readonly onStatus: (question: Question, status: QuestionStatus, actionId: string) => void
}) {
  const hideActionId = questionStatusActionId(question.id, "hide")
  const showActionId = questionStatusActionId(question.id, "show")
  const answeredActionId = questionStatusActionId(question.id, "answered")
  const unansweredActionId = questionStatusActionId(question.id, "unanswered")

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-md border border-zinc-200 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">
            {question.nickname} · 추천 {question.voteCount}
          </p>
          <p className="mt-2 leading-7">{question.body}</p>
        </div>
        <motion.button
          type="button"
          onClick={() => onPin(question)}
          disabled={activeAction === questionPinActionId(question.id)}
          whileTap={{ scale: 0.94 }}
          className="icon-button"
        >
          <AdminActionState
            actionId={questionPinActionId(question.id)}
            activeAction={activeAction}
            completedAction={completedAction}
          />
          <Pin className={`h-4 w-4 ${question.isPinned ? "text-cyan-700" : "text-zinc-500"}`} />
        </motion.button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Action
          actionId={hideActionId}
          activeAction={activeAction}
          completedAction={completedAction}
          icon={<EyeOff className="h-4 w-4" />}
          label="숨기기"
          onClick={() => onStatus(question, "hidden", hideActionId)}
        />
        <Action
          actionId={showActionId}
          activeAction={activeAction}
          completedAction={completedAction}
          icon={<Eye className="h-4 w-4" />}
          label="다시 보이기"
          onClick={() => onStatus(question, "visible", showActionId)}
        />
        <Action
          actionId={answeredActionId}
          activeAction={activeAction}
          completedAction={completedAction}
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="답변완료"
          onClick={() => onStatus(question, "answered", answeredActionId)}
        />
        <Action
          actionId={unansweredActionId}
          activeAction={activeAction}
          completedAction={completedAction}
          icon={<RotateCcw className="h-4 w-4" />}
          label="미완료"
          onClick={() => onStatus(question, "visible", unansweredActionId)}
        />
      </div>
    </motion.article>
  )
}

function Action({
  actionId,
  activeAction,
  completedAction,
  icon,
  label,
  onClick,
}: {
  readonly actionId: string
  readonly activeAction: string | null
  readonly completedAction: string | null
  readonly icon: React.ReactNode
  readonly label: string
  readonly onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={activeAction === actionId}
      whileTap={{ scale: 0.96 }}
      className="admin-action"
    >
      <AdminActionState actionId={actionId} activeAction={activeAction} completedAction={completedAction} />
      {icon}
      {label}
    </motion.button>
  )
}
