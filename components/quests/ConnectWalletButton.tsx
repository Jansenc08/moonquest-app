'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Loader2, Wallet, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectWalletButtonProps {
  isCompleted: boolean
  walletAddress?: string | null
  onComplete: (result: { points_earned: number; new_balance: number }) => void
}

export function ConnectWalletButton({ 
  isCompleted, 
  walletAddress, 
  onComplete 
}: ConnectWalletButtonProps) {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(isCompleted)

  useEffect(() => {
    if (isConnected && address && !saved && !isSaving) {
      saveWallet(address)
    }
  }, [isConnected, address, saved])

  async function saveWallet(walletAddr: string) {
    setIsSaving(true)
    try {
      const response = await fetch('/api/quests/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddr }),
      })
      const data = await response.json()
      if (data.success) {
        setSaved(true)
        onComplete(data)
      } else if (data.error === 'Already connected') {
        setSaved(true)
      }
    } catch (error) {
      console.error('Failed to save wallet:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Check database first — this is source of truth
  if (isCompleted) {
    return (
      <Button
        disabled
        className="w-full bg-[#1a1a1a] text-[#a3e635] cursor-not-allowed text-base font-bold h-[52px] rounded-lg"
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        {walletAddress 
          ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : 'Wallet Connected'
        }
      </Button>
    )
  }

  // Then check local saved state (for same-session completion)
  if (saved) {
    const displayAddress = walletAddress || address
    return (
      <Button
        disabled
        className="w-full bg-[#1a1a1a] text-[#a3e635] cursor-not-allowed text-base font-bold h-[52px] rounded-lg"
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        {displayAddress 
          ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
          : 'Wallet Connected'
        }
      </Button>
    )
  }

  // Only then check if saving
  if (isSaving) {
    return (
      <Button
        disabled
        className="w-full bg-[#a3e635]/50 text-black cursor-not-allowed text-base font-bold h-[52px] rounded-lg"
      >
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  // Only show green button if truly not completed
  return (
    <Button
      onClick={openConnectModal}
      className="w-full bg-[#a3e635] hover:bg-[#a3e635]/90 text-black text-base font-bold h-[52px] rounded-lg"
    >
      <Wallet className="h-5 w-5 mr-2" />
      Connect Wallet
    </Button>
  )
}
