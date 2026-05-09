"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Gamepad2,
  Menu,
  Flame,
  Coins,
  LogOut,
  Trophy,
  Gift,
  Home,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Profile {
  points_balance: number
  streak_count: number
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points_balance, streak_count")
          .eq("id", user.id)
          .single()
        setProfile(profile)
      }
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/quests", label: "Quests", icon: Trophy },
    { href: "/rewards", label: "Rewards", icon: Gift },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#222222] bg-[#080808]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <Gamepad2 className="h-6 w-6 text-white" />
              <span className="text-lg font-semibold text-white tracking-tight">
                Moonquest
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-[#666666] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-[#222222]" />
            ) : user ? (
              <>
                <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-[#111111] border border-[#222222]">
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-[#a3e635]" />
                    <span className="text-sm font-medium text-white">
                      {profile?.points_balance ?? 0}
                    </span>
                  </div>
                  <div className="w-px h-3 bg-[#222222]" />
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-[#a3e635]" />
                    <span className="text-sm font-medium text-white">
                      {profile?.streak_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-[#222222]">
                    <AvatarFallback className="bg-[#222222] text-white text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-[#666666] hover:text-white hover:bg-transparent"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-[#666666] hover:text-white hover:bg-transparent"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-white text-black hover:bg-white/90 font-medium px-5">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-80 bg-[#080808] border-[#222222]"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5 text-white">
                  <Gamepad2 className="h-5 w-5" />
                  <span className="font-semibold">Moonquest</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-[#666666] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 border-t border-[#222222] pt-8">
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                      <Avatar className="h-10 w-10 border border-[#222222]">
                        <AvatarFallback className="bg-[#222222] text-white">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-[#666666]">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-6 px-4">
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-[#a3e635]" />
                        <span className="text-sm font-medium text-white">
                          {profile?.points_balance ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-[#a3e635]" />
                        <span className="text-sm font-medium text-white">
                          {profile?.streak_count ?? 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 text-[#666666] hover:text-white hover:bg-transparent"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 px-4">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full border border-[#222222] text-white hover:bg-[#111111] hover:text-white"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-white text-black hover:bg-white/90 font-medium">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
