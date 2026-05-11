"use client"

import { useEffect, useState } from "react"
import {
  X,
  Coffee,
  Gamepad2,
  UserCircle,
  Crown,
  Shield,
  Package,
  Gift,
  Loader2,
} from "lucide-react"

interface Reward {
  id: string
  title: string
  description: string | null
  points_cost: number
  stock: number | null
}

interface RewardDetailsModalProps {
  reward: Reward | null
  isOpen: boolean
  onClose: () => void
  userBalance: number
  onRedeem: (rewardId: string) => void
  isRedeeming: boolean
}

function getRewardIcon(title: string) {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes("coffee")) return Coffee
  if (lowerTitle.includes("game") || lowerTitle.includes("credit")) return Gamepad2
  if (lowerTitle.includes("avatar")) return UserCircle
  if (lowerTitle.includes("premium") || lowerTitle.includes("pass")) return Crown
  if (lowerTitle.includes("badge") || lowerTitle.includes("onchain")) return Shield
  if (lowerTitle.includes("mystery") || lowerTitle.includes("box")) return Package
  return Gift
}

export function RewardDetailsModal({
  reward,
  isOpen,
  onClose,
  userBalance,
  onRedeem,
  isRedeeming,
}: RewardDetailsModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !reward) return null

  const isAffordable = userBalance >= reward.points_cost
  const isOutOfStock = reward.stock === 0
  const pointsNeeded = reward.points_cost - userBalance
  const remainingAfter = userBalance - reward.points_cost
  const Icon = getRewardIcon(reward.title)
  const isOnchainBadge = reward.title.toLowerCase().includes("onchain") || reward.title.toLowerCase().includes("badge")

  const getStockBadge = () => {
    if (reward.stock === -1 || reward.stock === null) {
      return { text: "UNLIMITED", bgColor: "#1a1a1a", textColor: "#888" }
    }
    if (reward.stock === 0) {
      return { text: "OUT OF STOCK", bgColor: "#1a0000", textColor: "#ef4444" }
    }
    return { text: `${reward.stock} IN STOCK`, bgColor: "#1a1a1a", textColor: "#888" }
  }

  const stockBadge = getStockBadge()

  return (
    <div
      className={`fixed inset-0 z-50 ${isMobile ? "flex items-end" : "flex items-center justify-center px-4"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${isMobile ? "animate-slide-up-mobile" : "max-w-[480px] animate-fade-in"}`}
        style={{
          backgroundColor: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          padding: isMobile ? "24px 20px 40px" : "32px",
          maxHeight: isMobile ? "90vh" : "auto",
          overflowY: isMobile ? "auto" : "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (mobile only) */}
        {isMobile && (
          <div className="flex justify-center mb-5">
            <div
              style={{
                width: "36px",
                height: "4px",
                backgroundColor: "#333",
                borderRadius: "2px",
              }}
            />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          style={{ top: isMobile ? "12px" : "16px" }}
        >
          <X className="h-5 w-5 text-[#666]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: isAffordable && !isOutOfStock ? "#1a3300" : "#1a1a1a",
              borderRadius: "10px",
            }}
          >
            <Icon
              className="h-6 w-6"
              style={{ color: isAffordable && !isOutOfStock ? "#a3e635" : "#444" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className="px-3 py-1 text-xs font-bold uppercase rounded"
                style={{
                  backgroundColor: stockBadge.bgColor,
                  color: stockBadge.textColor,
                }}
              >
                {stockBadge.text}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white truncate">
              {reward.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p
          className="mb-6"
          style={{ color: "#888", fontSize: "14px", lineHeight: "1.6" }}
        >
          {reward.description || "Redeem this reward with your earned points."}
        </p>

        {/* How to Redeem */}
        <div
          className="mb-6"
          style={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <p
            className="font-bold uppercase tracking-wider mb-3"
            style={{ color: "#a3e635", fontSize: "11px" }}
          >
            HOW TO REDEEM
          </p>
          <div className="space-y-3">
            {[
              "Click Redeem and confirm the transaction",
              "Your reward details will be sent to your email",
              isOnchainBadge
                ? "Wallet connection coming soon — your badge will be reserved"
                : "Follow the instructions to claim your reward",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#a3e635",
                    color: "#000",
                    borderRadius: "50%",
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.5" }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost vs Balance */}
        <div
          className="mb-6"
          style={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p style={{ color: "#666", fontSize: "12px" }}>Cost</p>
              <p
                className="font-bold"
                style={{ color: "#a3e635", fontSize: "20px" }}
              >
                {reward.points_cost.toLocaleString()} pts
              </p>
            </div>
            <div className="text-right">
              <p style={{ color: "#666", fontSize: "12px" }}>Your balance</p>
              <p
                className="font-bold"
                style={{ color: "#fff", fontSize: "20px" }}
              >
                {userBalance.toLocaleString()} pts
              </p>
            </div>
          </div>
          {isAffordable && !isOutOfStock && (
            <p style={{ color: "#666", fontSize: "12px", marginTop: "8px" }}>
              After redemption: {remainingAfter.toLocaleString()} pts remaining
            </p>
          )}
        </div>

        {/* Redeem Button */}
        <button
          onClick={() => {
            if (isAffordable && !isOutOfStock && !isRedeeming) {
              onRedeem(reward.id)
            }
          }}
          disabled={!isAffordable || isOutOfStock || isRedeeming}
          className="w-full flex items-center justify-center gap-2 font-semibold transition-colors"
          style={{
            height: "48px",
            borderRadius: "10px",
            backgroundColor:
              isAffordable && !isOutOfStock ? "#a3e635" : "#1a1a1a",
            color: isAffordable && !isOutOfStock ? "#000" : "#555",
            cursor:
              isAffordable && !isOutOfStock && !isRedeeming
                ? "pointer"
                : "not-allowed",
          }}
        >
          {isRedeeming ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Redeeming...
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : isAffordable ? (
            `Redeem for ${reward.points_cost.toLocaleString()} pts`
          ) : (
            `Need ${pointsNeeded.toLocaleString()} more pts`
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes slideUpMobile {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up-mobile {
          animation: slideUpMobile 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  )
}
