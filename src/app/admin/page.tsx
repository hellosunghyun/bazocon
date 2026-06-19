import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminLogin } from "@/components/admin-login"
import { getAppSnapshot, getSessionSnapshot } from "@/lib/data"
import { isAdminAuthenticated } from "@/lib/security"

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminLogin />
  }

  const app = await getAppSnapshot()
  const firstQnaSession = app.sessions.find((session) => session.isPublicQnaEnabled)
  const initialSession =
    firstQnaSession === undefined ? null : await getSessionSnapshot(firstQnaSession.slug, null, true)

  return <AdminDashboard initialApp={app} initialSession={initialSession} />
}
