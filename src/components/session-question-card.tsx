import { Pin, ThumbsUp } from "lucide-react"
import { motion } from "motion/react"
import type { Question } from "@/lib/types"

export function QuestionCard({
  question,
  onVote,
}: {
  readonly question: Question
  readonly onVote: (question: Question) => void
}) {
  const voteClass = question.isOwn
    ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
    : question.hasVoted
      ? "bg-cyan-200 text-cyan-950"
      : "bg-zinc-100 text-zinc-700 hover:bg-cyan-50"

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-500">{question.nickname}</p>
          <p className="mt-2 text-base leading-7">{question.body}</p>
        </div>
        {question.isPinned ? <Pin className="h-4 w-4 shrink-0 text-cyan-700" /> : null}
      </div>
      {question.isOwn ? (
        <motion.button
          type="button"
          onClick={() => onVote(question)}
          disabled
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition ${voteClass}`}
        >
          <ThumbsUp className="h-4 w-4" />
          내 질문
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={() => onVote(question)}
          whileTap={{ scale: 0.94 }}
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition ${voteClass}`}
        >
          <ThumbsUp className="h-4 w-4" />
          {question.voteCount}
        </motion.button>
      )}
    </motion.article>
  )
}
