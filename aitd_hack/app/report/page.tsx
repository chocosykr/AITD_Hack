import { ReportItemForm } from "@/components/ReportItemForm"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  return (
    <div className="container py-10">
      <ReportItemForm />
    </div>
  )
}