import { HomeShell } from "@/components/home-shell"
import { getAppSnapshot } from "@/lib/data"

export default async function HomePage() {
  return <HomeShell initialSnapshot={await getAppSnapshot()} />
}
