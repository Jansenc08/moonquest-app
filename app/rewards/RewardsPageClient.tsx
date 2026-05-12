"use client"

import { useState } from "react"
import {
  Gift,
  Coffee,
  Headphones,
  Award,
  Coins,
  Zap,
  Moon,
  Crown,
  Rocket,
  Star,
  UserCircle,
  Gamepad2,
  X,
  Loader2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Reward = {
  id: string
  title: string
  description: string | null
  points_cost: number
  stock: number | null
  is_active: boolean
  category: string
}

type Tab = "all" | "featured" | "web3" | "nft"

interface RewardsPageClientProps {
  rewards: Reward[]
  pointsBalance: number
  walletAddress: string | null
}

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "web3", label: "Web3" },
  { id: "nft", label: "NFTs" },
]

const headings: Record<Tab, { title: string; sub: string }> = {
  all: {
    title: "All Rewards",
    sub: "Browse all available rewards across every category",
  },
  featured: {
    title: "Featured Rewards",
    sub: "Physical perks, vouchers, and premium drops",
  },
  web3: {
    title: "Web3 Rewards",
    sub: "Wallet-gated drops, onchain badges, and token vouchers",
  },
  nft: {
    title: "NFT Collectibles",
    sub: "Exclusive NFTs tied to your streak milestones",
  },
}

function getCategoryColor(category: string): string {
  if (category === "featured") return "#a3e635"
  if (category === "web3") return "#6366f1"
  if (category === "nft") return "#f97316"
  return "#a3e635"
}

function getCategoryLabel(category: string): string {
  if (category === "featured") return "Featured"
  if (category === "web3") return "Web3"
  if (category === "nft") return "NFT"
  return "Featured"
}

function getRarity(pointsCost: number): string {
  if (pointsCost >= 800) return "Ultra Rare"
  if (pointsCost >= 500) return "Legendary"
  return "Rare"
}

function getRarityColors(rarity: string) {
  if (rarity === "Ultra Rare")
    return { color: "#ef4444", border: "#ef444440", bg: "#1a000040" }
  if (rarity === "Legendary")
    return { color: "#f97316", border: "#f9731640", bg: "#2a150040" }
  return { color: "#818cf8", border: "#818cf840", bg: "#13134a40" }
}

function getRewardIcon(title: string, category: string): LucideIcon {
  const t = title.toLowerCase()
  if (t.includes("mystery") || t.includes("box")) return Gift
  if (t.includes("coffee")) return Coffee
  if (t.includes("headset") || t.includes("headphone")) return Headphones
  if (t.includes("badge")) return Award
  if (t.includes("token") || t.includes("voucher")) return Coins
  if (t.includes("whitelist") || t.includes("spot")) return Zap
  if (t.includes("moon")) return Moon
  if (t.includes("champion") || t.includes("crown")) return Crown
  if (t.includes("genesis") || t.includes("pass") || t.includes("rocket"))
    return Rocket
  if (t.includes("avatar")) return UserCircle
  if (t.includes("game") || t.includes("credit")) return Gamepad2
  if (t.includes("premium") || t.includes("week")) return Star
  return Gift
}

function getStockDisplay(stock: number | null): React.ReactNode {
  if (stock === null) return "Unlimited"
  if (stock > 5) return `${stock} in stock`
  return <span style={{ color: "#f97316" }}>{stock} left</span>
}

export function RewardsPageClient({
  rewards,
  pointsBalance: initialPointsBalance,
  walletAddress,
}: RewardsPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [pointsBalance, setPointsBalance] = useState(initialPointsBalance)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)

  const visibleRewards =
    activeTab === "all"
      ? rewards
      : rewards.filter((r) => r.category === activeTab)

  async function handleRedeem() {
    if (!selectedReward) return

    setIsRedeeming(true)
    try {
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward_id: selectedReward.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to redeem reward")
        return
      }

      setPointsBalance((prev) => prev - selectedReward.points_cost)
      setIsModalOpen(false)
      setSelectedReward(null)

      if (selectedReward.category === "nft") {
        alert(
          "Your NFT will be airdropped to your connected wallet within 24 hours"
        )
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setIsRedeeming(false)
    }
  }

  function getCtaLabel(category: string): string {
    if (category === "web3") return "Mint to Wallet"
    if (category === "nft") return "Claim NFT"
    return "Confirm Redemption"
  }

  function getButtonLabel(category: string, isLocked: boolean): string {
    if (isLocked) return "Locked"
    if (category === "web3")
      return walletAddress ? "Mint" : "Connect Wallet First"
    if (category === "nft")
      return walletAddress ? "Claim NFT" : "Connect Wallet First"
    return "Redeem"
  }

  function getButtonStyles(
    category: string,
    isLocked: boolean
  ): React.CSSProperties {
    if (isLocked) {
      return { background: "#1a1a1a", color: "#333", cursor: "not-allowed" }
    }
    if (category === "featured") {
      return { background: "#a3e635", color: "#000" }
    }
    if (category === "web3") {
      return walletAddress
        ? { background: "#6366f1", color: "#fff" }
        : { background: "#1a1a1a", color: "#555", cursor: "not-allowed" }
    }
    if (category === "nft") {
      return walletAddress
        ? { background: "#f97316", color: "#000" }
        : { background: "#1a1a1a", color: "#555", cursor: "not-allowed" }
    }
    return { background: "#a3e635", color: "#000" }
  }

  function isButtonDisabled(category: string, isLocked: boolean): boolean {
    if (isLocked) return true
    if ((category === "web3" || category === "nft") && !walletAddress)
      return true
    return false
  }

  function openModal(reward: Reward) {
    setSelectedReward(reward)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedReward(null)
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
        <div>
          <p className="text-[10px] text-[#a3e635] uppercase tracking-widest mb-2">
            REWARDS STORE
          </p>
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-2">
            Loot Shop
          </h1>
          <p className="text-lg text-[#555]">
            Spend your hard-earned points on exclusive rewards
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#111] border border-[#222] self-start md:self-auto">
          <Coins className="h-6 w-6 text-[#a3e635]" />
          <span className="text-2xl font-bold text-[#a3e635]">
            {pointsBalance.toLocaleString()}
          </span>
          <span className="text-sm text-[#444]">pts</span>
        </div>
      </div>

      {/* TAB SYSTEM */}
      <div className="flex gap-2 md:gap-3 flex-wrap mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 md:px-8 md:py-3 rounded-full text-sm md:text-base font-bold transition-all duration-150 cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === tab.id
                ? "bg-white text-black border-[1.5px] border-white"
                : "bg-transparent text-[#555] border-[1.5px] border-[#333] hover:text-[#aaa] hover:border-[#555]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION HEADING */}
      <div key={activeTab} className="animate-fade-in">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">
          {headings[activeTab].title}
        </h2>
        <p className="text-sm md:text-base text-[#444] mb-6">
          {headings[activeTab].sub}
        </p>

        {/* CARD GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
          {visibleRewards.map((reward) => {
            const isLocked = pointsBalance < reward.points_cost
            const pointsNeeded = reward.points_cost - pointsBalance
            const categoryColor = getCategoryColor(reward.category)
            const IconComponent = getRewardIcon(reward.title, reward.category)
            const isNft = reward.category === "nft"
            const rarity = getRarity(reward.points_cost)
            const rarityColors = getRarityColors(rarity)

            return (
              <div
                key={reward.id}
                className="reward-card relative rounded-2xl overflow-hidden cursor-pointer flex flex-col min-h-[300px] md:min-h-[340px]"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                onClick={() => {
                  if (!isButtonDisabled(reward.category, isLocked)) {
                    openModal(reward)
                  }
                }}
              >
                {/* CATEGORY TOP STRIPE */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: categoryColor }}
                />

                <div className="p-6 md:p-10 flex flex-col flex-1">
                  {/* TOP RIGHT: ? BUTTON + BADGE */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openModal(reward)
                      }}
                      className="w-[22px] h-[22px] rounded-full bg-[#1a1a1a] border border-[#333] text-[#666] text-[11px] font-bold flex items-center justify-center hover:bg-[#a3e635] hover:border-[#a3e635] hover:text-black transition-all duration-200"
                    >
                      ?
                    </button>
                    {isNft ? (
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border"
                        style={{
                          color: rarityColors.color,
                          borderColor: rarityColors.border,
                          background: rarityColors.bg,
                        }}
                      >
                        {rarity}
                      </span>
                    ) : (
                      <span className="text-sm text-[#444]">
                        {getStockDisplay(reward.stock)}
                      </span>
                    )}
                  </div>

                  {/* ICON BOX */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-center mb-3">
                    <IconComponent
                      className="w-7 h-7 md:w-8 md:h-8"
                      style={{ color: categoryColor }}
                    />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-2xl xl:text-3xl font-bold text-white mb-1">
                    {reward.title}
                  </h3>

                  {/* CATEGORY PILL */}
                  <span
                    className="inline-flex items-center gap-1 text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border mb-2 md:mb-3 w-fit"
                    style={{
                      color: categoryColor,
                      borderColor: categoryColor + "40",
                      background: categoryColor + "10",
                    }}
                  >
                    {getCategoryLabel(reward.category)}
                  </span>

                  {/* DESCRIPTION - flex-grow to push bottom to card edge */}
                  <p className="text-lg xl:text-xl text-[#666666] leading-relaxed flex-grow">
                    {reward.description}
                  </p>

                  {/* CARD BOTTOM */}
                  <div className="flex items-end justify-between gap-3 mt-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold text-white">
                        {reward.points_cost}{" "}
                        <span className="text-lg text-[#666666]">pts</span>
                      </p>
                      {isLocked && (
                        <p className="text-base text-[#666666] mt-0.5">
                          Need {pointsNeeded} more
                        </p>
                      )}
                    </div>
                    <button
                      className="flex-shrink-0 text-base font-bold px-6 h-[52px] rounded-lg border-none cursor-pointer transition-opacity hover:opacity-85"
                      style={getButtonStyles(reward.category, isLocked)}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isButtonDisabled(reward.category, isLocked)) {
                          openModal(reward)
                        }
                      }}
                      disabled={isButtonDisabled(reward.category, isLocked)}
                    >
                      {getButtonLabel(reward.category, isLocked)}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {visibleRewards.length === 0 && (
          <div className="text-center py-20">
            <Gift className="h-16 w-16 text-[#333] mx-auto mb-4" />
            <p className="text-xl text-[#666]">No rewards in this category</p>
            <p className="text-sm text-[#444] mt-2">
              Check back soon for new rewards
            </p>
          </div>
        )}
      </div>

      {/* REDEMPTION MODAL */}
      {isModalOpen && selectedReward && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80"
          onClick={closeModal}
        >
          <div
            className="bg-[#111] border-t md:border border-[#333] rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag indicator */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-[#333]" />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {selectedReward.title}
                  </h2>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border"
                    style={{
                      color: getCategoryColor(selectedReward.category),
                      borderColor:
                        getCategoryColor(selectedReward.category) + "40",
                      background:
                        getCategoryColor(selectedReward.category) + "10",
                    }}
                  >
                    {getCategoryLabel(selectedReward.category)}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="text-[#555] hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-sm text-[#666] mb-6">
                {selectedReward.description}
              </p>

              {/* Points + Stock info */}
              <div className="flex flex-col gap-3 mb-6 p-4 rounded-xl bg-[#0a0a0a] border border-[#222]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-6 w-6 text-[#a3e635]" />
                    <span className="text-2xl font-bold text-white">
                      {selectedReward.points_cost}
                    </span>
                    <span className="text-sm text-[#444]">pts</span>
                  </div>
                  <span className="text-sm text-[#555]">
                    Balance: {pointsBalance.toLocaleString()} pts
                  </span>
                </div>
                <div className="text-xs text-[#444]">
                  Stock: {getStockDisplay(selectedReward.stock)}
                </div>
              </div>

              {(selectedReward.category === "web3" ||
                selectedReward.category === "nft") && (
                <div className="mb-6">
                  {walletAddress ? (
                    <p className="text-xs text-[#555]">
                      Reward will be sent to {walletAddress.slice(0, 6)}...
                      {walletAddress.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-xs text-[#f97316]">
                      Connect your wallet first to claim this reward
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleRedeem}
                disabled={
                  isRedeeming ||
                  isButtonDisabled(
                    selectedReward.category,
                    pointsBalance < selectedReward.points_cost
                  )
                }
                className="w-full py-4 rounded-xl font-bold text-base transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
                style={{
                  background: getCategoryColor(selectedReward.category),
                  color: selectedReward.category === "web3" ? "#fff" : "#000",
                }}
              >
                {isRedeeming ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  getCtaLabel(selectedReward.category)
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
