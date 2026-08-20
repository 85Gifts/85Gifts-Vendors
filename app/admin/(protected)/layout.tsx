import AdminRouteGuard from "@/components/admin/AdminRouteGuard"
import { AdminShell } from "@/components/admin/AdminShell"

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRouteGuard>
      <AdminShell>{children}</AdminShell>
    </AdminRouteGuard>
  )
}