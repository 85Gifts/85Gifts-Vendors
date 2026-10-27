import StorefrontDetail from "@/components/storefronts/StorefrontDetail"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <StorefrontDetail storefrontId={id} />
}
