import { ExternalLink, Home, MessageSquare, MonitorUp } from "lucide-react"
import Link from "next/link"
import { Panel } from "@/components/admin-panel"
import type { Session } from "@/lib/types"

export function AdminQuickLinks({ selectedSession }: { readonly selectedSession: Session | null }) {
  return (
    <Panel title="바로가기">
      <div className="grid gap-2">
        <QuickLink href="/" icon={<Home className="h-4 w-4" />} label="행사 홈" />
        <QuickLink href="/screen/current" icon={<MonitorUp className="h-4 w-4" />} label="현재 띄우기 화면" newTab />
        {selectedSession === null ? null : (
          <>
            <QuickLink
              href={`/s/${selectedSession.slug}`}
              icon={<MessageSquare className="h-4 w-4" />}
              label="선택 세션 질문방"
            />
            <QuickLink
              href={`/screen/${selectedSession.slug}`}
              icon={<MonitorUp className="h-4 w-4" />}
              label="선택 세션 띄우기"
              newTab
            />
          </>
        )}
      </div>
    </Panel>
  )
}

function QuickLink({
  href,
  icon,
  label,
  newTab = false,
}: {
  readonly href: string
  readonly icon: React.ReactNode
  readonly label: string
  readonly newTab?: boolean
}) {
  return (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      className="inline-flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm font-black text-zinc-800 transition hover:border-cyan-500 hover:bg-cyan-50"
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      {newTab ? <ExternalLink className="h-3.5 w-3.5 text-zinc-500" /> : null}
    </Link>
  )
}
