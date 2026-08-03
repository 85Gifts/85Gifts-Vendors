import ResellerRouteGuard from "@/components/reseller/ResellerRouteGuard"

export default function ResellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ResellerRouteGuard>{children}</ResellerRouteGuard>
}
