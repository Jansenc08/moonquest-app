import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { CheckInButton } from "./CheckInButton"
import {
  Coins,
  Flame,
  Trophy,
  Gift,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react"

export async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { count: questsCompleted } = await supabase
    .from("quest_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { data: recentActivity } = await supabase
    .from("quest_completions")
    .select(`
      id,
      completed_at,
      quests (
        title,
        points_reward
      )
    `)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5)

  const { data: recentRedemptions } = await supabase
    .from("redemptions")
    .select(`
      id,
      redeemed_at,
      points_spent,
      rewards (
        title
      )
    `)
    .eq("user_id", user.id)
    .order("redeemed_at", { ascending: false })
    .limit(5)

  const today = new Date().toISOString().split("T")[0]
  const lastCheckin = profile?.last_checkin_at
    ? new Date(profile.last_checkin_at).toISOString().split("T")[0]
    : null
  const hasCheckedInToday = lastCheckin === today

  const username = profile?.username || user.email?.split("@")[0] || "Gamer"

  type Activity = {
    id: string
    type: "quest" | "redemption"
    title: string
    points: number
    date: string
  }

  const activities: Activity[] = [
    ...(recentActivity || []).map((item) => {
      const quest = item.quests as unknown as { title: string; points_reward: number } | null
      return {
        id: item.id,
        type: "quest" as const,
        title: quest?.title || "Quest",
        points: quest?.points_reward || 0,
        date: item.completed_at,
      }
    }),
    ...(recentRedemptions || []).map((item) => {
      const reward = item.rewards as unknown as { title: string } | null
      return {
        id: item.id,
        type: "redemption" as const,
        title: reward?.title || "Reward",
        points: -item.points_spent,
        date: item.redeemed_at,
      }
    }),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="pt-24 pb-12 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {username}! 👋
            </h1>
            <p className="text-[#666666] text-lg">
              Here&apos;s your gaming rewards overview
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-[#111111] border-[#222222]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
                    <Coins className="h-7 w-7 text-[#a3e635]" />
                  </div>
                  <div>
                    <p className="text-[#666666] text-sm mb-1">Points Balance</p>
                    <p className="text-3xl font-bold text-white">
                      {(profile?.points_balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#222222]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Flame className="h-7 w-7 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[#666666] text-sm mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-white">
                      {profile?.streak_count || 0} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#222222]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[#666666] text-sm mb-1">Quests Completed</p>
                    <p className="text-3xl font-bold text-white">
                      {questsCompleted || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Check-in */}
          <Card className="bg-[#111111] border-[#222222] mb-10">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Daily Check-in
                </h2>
                <p className="text-[#666666]">
                  Check in daily to earn bonus points and maintain your streak
                </p>
              </div>
              <CheckInButton hasCheckedIn={hasCheckedInToday} />
              {profile?.streak_count ? (
                <p className="mt-4 text-sm text-[#666666]">
                  🔥 Current streak: {profile.streak_count} day{profile.streak_count > 1 ? "s" : ""}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Link href="/quests">
              <Card className="bg-[#111111] border-[#222222] hover:border-[#a3e635]/50 transition-all duration-300 hover:shadow-[0_0_24px_rgba(163,230,53,0.1)] group cursor-pointer h-full">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-[#12122a] flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-[#a3e635]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Browse Quests
                      </h3>
                      <p className="text-[#666666]">
                        Complete challenges to earn points
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-[#666666] group-hover:text-[#a3e635] group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/rewards">
              <Card className="bg-[#111111] border-[#222222] hover:border-[#a3e635]/50 transition-all duration-300 hover:shadow-[0_0_24px_rgba(163,230,53,0.1)] group cursor-pointer h-full">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-[#12122a] flex items-center justify-center">
                      <Gift className="h-8 w-8 text-[#a3e635]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Redeem Rewards
                      </h3>
                      <p className="text-[#666666]">
                        Exchange points for prizes
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-[#666666] group-hover:text-[#a3e635] group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card className="bg-[#111111] border-[#222222]">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">
                Recent Activity
              </h2>

              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-[#333333] mx-auto mb-4" />
                  <p className="text-[#666666]">No activity yet</p>
                  <p className="text-sm text-[#444444]">
                    Complete quests or redeem rewards to see your activity here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="flex items-center justify-between py-4 border-b border-[#222222] last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === "quest"
                              ? "bg-[#a3e635]/10"
                              : "bg-purple-500/10"
                          }`}
                        >
                          {activity.type === "quest" ? (
                            <CheckCircle2 className="h-5 w-5 text-[#a3e635]" />
                          ) : (
                            <Gift className="h-5 w-5 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm text-[#666666]">
                            {activity.type === "quest"
                              ? "Quest completed"
                              : "Reward redeemed"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            activity.points >= 0
                              ? "text-[#a3e635]"
                              : "text-purple-400"
                          }`}
                        >
                          {activity.points >= 0 ? "+" : ""}
                          {activity.points} pts
                        </p>
                        <p className="text-sm text-[#666666]">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
