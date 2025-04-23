import { DashboardContent } from "@/components/admin/dashboard-content";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { DashboardShell } from "@/components/admin/dashboard-shell";


export default function Home() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <DashboardContent />
    </DashboardShell>
  )
}
