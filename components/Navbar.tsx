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
  LayoutDashboard,
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

  const publicLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/quests", label: "Quests", icon: Trophy },
    { href: "/rewards", label: "Rewards", icon: Gift },
  ]

  const authLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/quests", label: "Quests", icon: Trophy },
    { href: "/rewards", label: "Rewards", icon: Gift },
  ]

  const navLinks = user ? authLinks : publicLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080808]/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1800px] px-6 lg:px-12 xl:px-20">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-14">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
              <Gamepad2 className="h-9 w-9 text-[#a3e635]" />
              <span className="text-2xl font-bold text-white tracking-tight">
                Moonquest
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-5 py-2.5 text-lg text-[#888888] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isLoading ? (
              <div className="h-12 w-36 animate-pulse rounded-full bg-[#222222]" />
            ) : user ? (
              <>
                <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-[#111111] border border-[#222222]">
                  <div className="flex items-center gap-2.5">
                    <Coins className="h-6 w-6 text-[#a3e635]" />
                    <span className="text-lg font-semibold text-white">
                      {profile?.points_balance ?? 0}
                    </span>
                  </div>
                  <div className="w-px h-5 bg-[#333333]" />
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <span className="text-lg font-semibold text-white">
                      {profile?.streak_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 border-2 border-[#333333]">
                    <AvatarFallback className="bg-[#222222] text-white text-lg font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-[#666666] hover:text-white hover:bg-white/5 h-11 w-11"
                  >
                    <LogOut className="h-6 w-6" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-lg text-[#888888] hover:text-white hover:bg-white/5 px-5 py-2.5 h-auto"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-white text-black hover:bg-white/90 font-semibold text-lg px-7 py-2.5 h-auto">
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
                <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                  <Menu className="h-7 w-7" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-80 bg-[#080808] border-[#222222]"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-white">
                  <Gamepad2 className="h-8 w-8 text-[#a3e635]" />
                  <span className="text-2xl font-bold">Moonquest</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-4 text-lg text-[#888888] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 border-t border-[#222222] pt-8">
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                      <Avatar className="h-14 w-14 border-2 border-[#333333]">
                        <AvatarFallback className="bg-[#222222] text-white text-xl font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-medium text-white">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-base text-[#666666]">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-8 px-4">
                      <div className="flex items-center gap-2.5">
                        <Coins className="h-6 w-6 text-[#a3e635]" />
                        <span className="text-lg font-semibold text-white">
                          {profile?.points_balance ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Flame className="h-6 w-6 text-orange-500" />
                        <span className="text-lg font-semibold text-white">
                          {profile?.streak_count ?? 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 text-lg text-[#888888] hover:text-white hover:bg-white/5 py-4 h-auto"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="h-6 w-6" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 px-4">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full border border-[#222222] text-white text-lg hover:bg-white/5 hover:text-white py-4 h-auto"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold text-lg py-4 h-auto">
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
