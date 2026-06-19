import { ScreenBoard } from "@/components/screen-board"
import { getCurrentScreenSnapshot } from "@/lib/data"

export default async function CurrentScreenPage() {
  return <ScreenBoard initialSnapshot={await getCurrentScreenSnapshot()} mode="current" />
}
