import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Console",
  description: "OmniFlow85 admin console",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}