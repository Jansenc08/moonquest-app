import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Gamepad2,
  Trophy,
  Gift,
  Zap,
  Target,
  Users,
  ArrowRight,
  Coins,
  Headphones,
  Shirt,
  Flame,
} from "lucide-react"

const featuredQuests = [
  {
    title: "Daily Login Streak",
    description: "Log in for 7 consecutive days",
    points: 500,
    icon: Zap,
    type: "Daily",
  },
  {
    title: "Social Butterfly",
    description: "Connect your Discord account",
    points: 250,
    icon: Users,
    type: "One-time",
  },
  {
    title: "First Victory",
    description: "Complete your first quest",
    points: 100,
    icon: Target,
    type: "One-time",
  },
]

const featuredRewards = [
  {
    title: "Premium Headset",
    description: "High-quality gaming headset",
    points: 5000,
    icon: Headphones,
  },
  {
    title: "Exclusive Hoodie",
    description: "Limited edition Moonquest merch",
    points: 3000,
    icon: Shirt,
  },
  {
    title: "Gift Card $50",
    description: "Steam, PlayStation, or Xbox",
    points: 2500,
    icon: Gift,
  },
]

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up in seconds and join thousands of gamers earning rewards",
    icon: Users,
  },
  {
    step: "02",
    title: "Complete Daily Quests",
    description: "Take on challenges, maintain streaks, and rack up points",
    icon: Target,
  },
  {
    step: "03",
    title: "Redeem Rewards",
    description: "Exchange your points for gaming gear, gift cards, and more",
    icon: Gift,
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[50%_50%] gap-8 lg:gap-12 items-center">
            {/* Left Side - Content */}
            <div className="py-8 lg:py-0">
              <p className="text-[#a3e635] text-base font-medium tracking-wide uppercase mb-4">
                Gaming Rewards Platform
              </p>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                Game. Complete.
                <br />
                Earn.
              </h1>

              <p className="text-2xl text-[#666666] max-w-lg mb-10 leading-relaxed">
                Complete quests, earn points, and redeem real rewards. Turn your
                gaming passion into tangible prizes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="h-14 px-10 bg-white text-black hover:bg-white/90 font-semibold text-lg"
                  >
                    Start Earning
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-14 px-10 border border-[#333333] text-white hover:bg-[#111111] hover:text-white font-semibold text-lg"
                  >
                    How It Works
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-10 max-w-lg">
                {[
                  { value: "10K+", label: "Active Gamers" },
                  { value: "50K+", label: "Quests Completed" },
                  { value: "$25K+", label: "Rewards Given" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-base text-[#666666]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Floating Cards */}
            <div className="hidden lg:block relative h-[550px]">
              {/* Subtle glow background */}
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(163, 230, 53, 0.06) 0%, transparent 70%)'
                }}
              />

              {/* Card 1 - Daily Check-in (Center) */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 animate-float"
                style={{ '--rotation': '-2deg' } as React.CSSProperties}
              >
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <Flame className="h-8 w-8 text-orange-500" />
                      <span className="font-semibold text-white text-lg">Daily Check-in</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-[#a3e635]/10 text-sm font-medium text-[#a3e635]">
                      +10 pts
                    </span>
                  </div>
                  <p className="text-[#666666] text-base mb-4">Day 3 Streak</p>
                  <div className="w-full h-3 bg-[#222222] rounded-full mb-5">
                    <div className="w-[43%] h-full bg-[#a3e635] rounded-full" />
                  </div>
                  <Button className="w-full bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-semibold text-base h-11">
                    Check In
                  </Button>
                </div>
              </div>

              {/* Card 2 - Points Balance (Top Right) */}
              <div 
                className="absolute right-0 top-8 w-64 animate-float-delayed-2"
                style={{ '--rotation': '3deg' } as React.CSSProperties}
              >
                <div className="bg-[#111111] border border-[#a3e635]/50 rounded-2xl p-6 shadow-2xl">
                  <p className="text-[#666666] text-sm uppercase tracking-wide mb-2">Your Balance</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-bold text-white">1,250</span>
                    <span className="text-[#666666] text-base">pts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a3e635] text-base">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>+50 today</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Reward Card (Bottom Left) */}
              <div 
                className="absolute left-4 bottom-12 w-72 animate-float-delayed-4"
                style={{ '--rotation': '-1deg' } as React.CSSProperties}
              >
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <Gift className="h-8 w-8 text-[#a3e635]" />
                    <div>
                      <p className="font-semibold text-white text-base">Coffee Voucher</p>
                      <p className="text-[#a3e635] text-sm font-medium">100 pts</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full border border-[#333333] text-white hover:bg-[#222222] hover:text-white text-base h-10"
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 border-t border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[#a3e635] text-sm font-medium tracking-wide uppercase mb-4">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Start earning in three steps
            </h2>
          </div>

          {/* Cards container with connecting line */}
          <div className="relative">
            {/* Connecting line behind cards */}
            <div className="hidden md:block absolute top-[88px] left-[15%] right-[15%] h-px bg-[#222222]" />
            
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div 
                  key={step.step}
                  className="group relative bg-[#111111] border border-[#222222] rounded-xl p-8 h-full transition-all duration-300 hover:border-[#a3e635] hover:shadow-[0_0_24px_rgba(163,230,53,0.12)] hover:-translate-y-1"
                >
                  {/* Icon box with step badge */}
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 rounded-[10px] bg-[#12122a] flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-[#a3e635]" />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#a3e635] flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{step.step}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#666666] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quests */}
      <section className="py-24 px-4 border-t border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#a3e635] text-sm font-medium tracking-wide uppercase mb-4">
                Quests
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Featured Quests
              </h2>
            </div>
            <Link href="/quests">
              <Button
                variant="ghost"
                className="text-[#666666] hover:text-white hover:bg-transparent"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredQuests.map((quest) => (
              <Card
                key={quest.title}
                className="bg-[#111111] border-[#222222] hover:border-[#a3e635]/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-2.5 rounded-lg bg-[#222222]">
                      <quest.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#a3e635]/10 text-xs font-medium text-[#a3e635]">
                      {quest.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {quest.title}
                  </h3>
                  <p className="text-[#666666] text-sm mb-6">
                    {quest.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-[#a3e635]" />
                      <span className="font-medium text-white">{quest.points}</span>
                      <span className="text-[#666666] text-sm">pts</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-[#222222]"
                    >
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rewards */}
      <section className="py-24 px-4 border-t border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#a3e635] text-sm font-medium tracking-wide uppercase mb-4">
                Rewards
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Featured Rewards
              </h2>
            </div>
            <Link href="/rewards">
              <Button
                variant="ghost"
                className="text-[#666666] hover:text-white hover:bg-transparent"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredRewards.map((reward) => (
              <Card
                key={reward.title}
                className="bg-[#111111] border-[#222222] hover:border-[#a3e635]/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="h-32 flex items-center justify-center mb-6 rounded-lg bg-[#080808]">
                    <reward.icon className="h-12 w-12 text-[#a3e635]" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">
                    {reward.title}
                  </h3>
                  <p className="text-[#666666] text-sm mb-6">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-[#a3e635]" />
                      <span className="font-medium text-white">
                        {reward.points.toLocaleString()}
                      </span>
                      <span className="text-[#666666] text-sm">pts</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-white/90 font-medium"
                    >
                      Redeem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-[#222222]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start earning?
          </h2>
          <p className="text-[#666666] text-lg mb-10 max-w-xl mx-auto">
            Join thousands of gamers who are already turning their gaming
            time into real rewards.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 px-8 bg-white text-black hover:bg-white/90 font-medium text-base"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222222] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">Moonquest</span>
            </div>

            <div className="flex items-center gap-8">
              <Link
                href="/quests"
                className="text-[#666666] hover:text-white transition-colors text-sm"
              >
                Quests
              </Link>
              <Link
                href="/rewards"
                className="text-[#666666] hover:text-white transition-colors text-sm"
              >
                Rewards
              </Link>
              <Link
                href="#"
                className="text-[#666666] hover:text-white transition-colors text-sm"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-[#666666] hover:text-white transition-colors text-sm"
              >
                Privacy
              </Link>
            </div>

            <p className="text-[#666666] text-sm">
              © 2026 Moonquest
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
