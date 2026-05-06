import type { ReactNode } from "react"
import { getMeAction } from "@/app/actions/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const me = await getMeAction()
  return <DashboardShell me={me}>{children}</DashboardShell>
}
