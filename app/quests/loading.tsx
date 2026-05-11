import { Navbar } from "@/components/Navbar"
import { Loader2 } from "lucide-react"

export default function QuestsLoading() {
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
