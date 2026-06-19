type PanelTone = "default" | "control"

const PANEL_CLASSES: Record<PanelTone, string> = {
  default: "rounded-lg border border-zinc-200 bg-white p-4 shadow-sm",
  control: "rounded-lg border-2 border-cyan-500 bg-cyan-50 p-4 shadow-md shadow-cyan-900/10",
}

export function Panel({
  title,
  tone = "default",
  children,
}: {
  readonly title: string
  readonly tone?: PanelTone
  readonly children: React.ReactNode
}) {
  return (
    <div className={PANEL_CLASSES[tone]}>
      <h2 className={`mb-3 text-sm font-bold ${tone === "control" ? "text-cyan-950" : "text-zinc-600"}`}>
        {title}
      </h2>
      {children}
    </div>
  )
}
