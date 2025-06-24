import { Link } from "react-router-dom"
import LiveActionIcon from "@/assets/icons/live-action.svg?react"

export function LiveActionButton() {
  return (
    <Link
      to="/liveaction"
      className="flex items-center justify-center gap-2 max-w-64 h-[55px] w-[224px] bg-[#4A4A4A] text-[#BBBBBB] rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <LiveActionIcon width={24} height={undefined}/>
      <span className="text-sm font-medium">Live Action</span>
    </Link>
  )
}
