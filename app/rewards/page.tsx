"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { RewardDetailsModal } from "@/components/rewards/RewardDetailsModal"
import {
  Coins,
  Coffee,
  Gamepad2,
  UserCircle,
  Crown,
  Shield,
  Package,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react"

type Reward = {
  id: string
  title: string
  description: string | null
  points_cost: number
  stock: number | null
  is_active: boolean
}

const iconMap: Record<string, React.ElementType> = {
  "Coffee Voucher": Coffee,
  "Game Credit $5": Gamepad2,
  "Exclusive Avatar": UserCircle,
  "Premium Week Pass": Crown,
  "Onchain Badge": Shield,
  "Mystery Box": Package,
}

export default function RewardsPage() {
  const router = useRouter()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [pointsBalance, setPointsBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [redeemedReward, setRedeemedReward] = useState<{
    title: string
    pointsSpent: number
    newBalance: number
  } | null>(null)
  const [recentlyRedeemed, setRecentlyRedeemed] = useState<string | null>(null)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
      }

      if (!user) {
        router.push("/login")
        return
      }

      console.log("Fetching data for user:", user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("points_balance")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
      }

      const { data: rewardsData, error: rewardsError } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_cost", { ascending: true })

      if (rewardsError) {
        console.error("Rewards fetch error:", rewardsError)
      }

      console.log("Profile:", profile)
      console.log("Rewards:", rewardsData)

      setPointsBalance(profile?.points_balance || 0)
      setRewards(rewardsData || [])
      setLoading(false)
    }

    fetchData()
  }, [router])

  async function handleRedeem(reward: Reward) {
    setRedeeming(reward.id)

    try {
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward_id: reward.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to redeem reward")
        return
      }

      setPointsBalance(data.new_balance)
      setRedeemedReward({
        title: data.reward_title,
        pointsSpent: data.points_spent,
        newBalance: data.new_balance,
      })
      setRecentlyRedeemed(reward.id)
      setShowModal(true)

      // Update stock locally
      setRewards((prev) =>
        prev.map((r) =>
          r.id === reward.id && r.stock !== null && r.stock !== -1
            ? { ...r, stock: r.stock - 1 }
            : r
        )
      )

      // Check if it's the Onchain Badge
      if (reward.title === "Onchain Badge") {
        setTimeout(() => {
          setShowModal(false)
          setShowBadgeModal(true)
        }, 2000)
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setRedeeming(null)
    }
  }

  function closeModal() {
    setShowModal(false)
    setRedeemedReward(null)
  }

  function closeBadgeModal() {
    setShowBadgeModal(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808]">
        <Navbar />
        <div className="pt-28 pb-20 w-full px-6 md:px-12 xl:px-[48px]">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 text-[#a3e635] animate-spin" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="pt-28 pb-20 w-full px-6 md:px-12 xl:px-[48px]">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* PAGE HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 animate-slide-up">
            <div>
              <p className="text-base text-[#a3e635] uppercase tracking-widest mb-3">
                Rewards Store
              </p>
              <h1 className="text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
                Loot Shop
              </h1>
              <p className="text-2xl text-[#888888] max-w-3xl">
                Spend your hard-earned points
              </p>
            </div>

            <div className="flex items-center gap-4 px-8 py-4 rounded-full bg-[#111111] border border-[#222222]">
              <Coins className="h-8 w-8 text-[#a3e635]" />
              <span className="text-3xl font-bold text-[#a3e635]">
                {pointsBalance.toLocaleString()}
              </span>
              <span className="text-lg text-[#666666]">pts</span>
            </div>
          </div>

          {/* REWARDS GRID */}
          {rewards.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-[#333333] mx-auto mb-4" />
              <p className="text-xl text-[#666666]">No rewards available</p>
              <p className="text-sm text-[#444444] mt-2">
                Check browser console for errors
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {rewards.map((reward) => {
                const isAffordable = pointsBalance >= reward.points_cost
                const isOutOfStock = reward.stock === 0
                const IconComponent = iconMap[reward.title] || Package
                const pointsNeeded = reward.points_cost - pointsBalance

                return (
                  <div
                    key={reward.id}
                    className={`rounded-xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                      isAffordable && !isOutOfStock
                        ? "bg-[#0d1a00] border-[#a3e635] hover:-translate-y-1"
                        : "bg-[#111111] border-[#1a1a1a] opacity-70"
                    }`}
                    style={{ minHeight: "200px" }}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                              isAffordable && !isOutOfStock
                                ? "bg-[#1a3300]"
                                : "bg-[#1a1a1a]"
                            }`}
                          >
                            <IconComponent
                              className={`h-6 w-6 ${
                                isAffordable && !isOutOfStock
                                  ? "text-[#a3e635]"
                                  : "text-[#444444]"
                              }`}
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedReward(reward)
                              setIsRewardModalOpen(true)
                            }}
                            className="w-[22px] h-[22px] rounded-full bg-[#1a1a1a] border border-[#333] text-[#666] text-[11px] font-bold flex items-center justify-center hover:bg-[#a3e635] hover:border-[#a3e635] hover:text-black transition-all duration-200"
                          >
                            ?
                          </button>
                        </div>
                        <span className="text-xs text-[#666666]">
                          {reward.stock === -1 || reward.stock === null
                            ? "Unlimited"
                            : `${reward.stock} in stock`}
                        </span>
                      </div>

                      <h3 className="text-base font-bold mb-2 text-white">
                        {reward.title}
                      </h3>
                      <p
                        className={`text-xs mb-4 ${
                          isAffordable && !isOutOfStock
                            ? "text-[#666666]"
                            : "text-[#555555]"
                        }`}
                      >
                        {reward.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Coins
                          className={`h-5 w-5 ${
                            isAffordable && !isOutOfStock
                              ? "text-[#a3e635]"
                              : "text-[#666666]"
                          }`}
                        />
                        <span
                          className={`text-lg font-bold ${
                            isAffordable && !isOutOfStock
                              ? "text-[#a3e635]"
                              : "text-[#666666]"
                          }`}
                        >
                          {reward.points_cost}
                        </span>
                        {!isAffordable && !isOutOfStock && (
                          <span className="text-xs text-[#555555] ml-2">
                            Need {pointsNeeded} more pts
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={
                          !isAffordable ||
                          isOutOfStock ||
                          redeeming === reward.id
                        }
                        className={`w-full h-11 font-semibold ${
                          isAffordable && !isOutOfStock
                            ? "bg-[#a3e635] text-black hover:bg-[#a3e635]/90"
                            : "bg-[#1a1a1a] text-[#555555] cursor-not-allowed"
                        }`}
                      >
                        {redeeming === reward.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isOutOfStock ? (
                          "Out of Stock"
                        ) : isAffordable ? (
                          "Redeem"
                        ) : (
                          "Locked"
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showModal && redeemedReward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeModal}
        >
          <Card
            className="bg-[#111111] border-[#a3e635] max-w-md w-full mx-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: "16px" }}
          >
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-[#a3e635] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Reward Redeemed!
              </h2>
              <p className="text-lg text-[#a3e635] mb-4">
                {redeemedReward.title}
              </p>
              <p className="text-sm text-[#666666] mb-2">
                {redeemedReward.pointsSpent} pts deducted
              </p>
              <p className="text-base text-[#a3e635] font-semibold mb-6">
                New balance: {redeemedReward.newBalance.toLocaleString()} pts
              </p>
              <Button
                onClick={closeModal}
                className="bg-[#1a1a1a] text-white hover:bg-[#222222]"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ONCHAIN BADGE MODAL */}
      {showBadgeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeBadgeModal}
        >
          <Card
            className="bg-[#111111] border-[#a3e635] max-w-md w-full mx-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: "16px" }}
          >
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-[#a3e635] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Badge is Ready!
              </h2>
              <p className="text-base text-[#888888] mb-4">
                Wallet connection coming soon — your badge has been reserved.
              </p>
              <span className="inline-block px-4 py-2 rounded-full bg-[#222222] text-[#666666] text-sm font-medium mb-6">
                Coming Soon
              </span>
              <div>
                <Button
                  onClick={closeBadgeModal}
                  className="bg-[#1a1a1a] text-white hover:bg-[#222222]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reward Details Modal */}
      <RewardDetailsModal
        reward={selectedReward}
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        userBalance={pointsBalance}
        onRedeem={(rewardId) => {
          const reward = rewards.find((r) => r.id === rewardId)
          if (reward) {
            setIsRewardModalOpen(false)
            handleRedeem(reward)
          }
        }}
        isRedeeming={redeeming === selectedReward?.id}
      />
    </main>
  )
}
