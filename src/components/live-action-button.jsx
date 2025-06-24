import { Link } from "react-router-dom"

export function LiveActionButton() {
  return (
    <Link
      to="/liveaction"
      className="flex items-center justify-center gap-3 w-full max-w-64 h-[55px] py-3 px-6 bg-[#4A4A4A] text-white rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex items-center justify-center w-8 h-8">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M2 7L6 3H18L22 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm font-medium">Live Action</span>
    </Link>
  )
}
