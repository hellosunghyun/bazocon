import { notFound } from "next/navigation"
import { ScreenBoard } from "@/components/screen-board"
import { getScreenSnapshot } from "@/lib/data"

export default async function FixedScreenPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const snapshot = await getScreenSnapshot(slug)
  if (snapshot === null) {
    notFound()
  }
  return <ScreenBoard initialSnapshot={snapshot} mode="fixed" />
}
