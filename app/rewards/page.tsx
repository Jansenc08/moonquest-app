import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { RewardsPageClient } from "./RewardsPageClient"

export default async function RewardsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("points_cost", { ascending: true })

  const { data: profile } = await supabase
    .from("profiles")
    .select("points_balance, wallet_address")
    .eq("id", user.id)
    .single()

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />
      <div className="pt-28 pb-20 px-6 md:px-12 xl:px-[48px]">
        <div className="w-full max-w-[min(1920px,100%)] mx-auto">
          <RewardsPageClient
            rewards={rewards ?? []}
            pointsBalance={profile?.points_balance ?? 0}
            walletAddress={profile?.wallet_address ?? null}
          />
        </div>
      </div>
    </main>
  )
}
