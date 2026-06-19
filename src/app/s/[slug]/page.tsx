import { notFound } from "next/navigation"
import { SessionRoom } from "@/components/session-room"
import { getSessionSnapshot } from "@/lib/data"

export default async function SessionPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const snapshot = await getSessionSnapshot(slug, null, false)
  if (snapshot === null || !snapshot.session.isPublicQnaEnabled) {
    notFound()
  }
  return <SessionRoom initialSnapshot={snapshot} />
}
