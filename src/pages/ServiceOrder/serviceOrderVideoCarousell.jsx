import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function ServiceOrderMediaCarousel({ image, video, altText }) {
  const [showVideo, setShowVideo] = useState(false)

  return (
    <div className="relative">
      {showVideo ? (
        <video src={video} className="w-full h-[280px] object-cover rounded-lg" controls autoPlay />
      ) : (
        <img
          src={image || "/placeholder.svg"}
          alt={altText || ""}
          className="w-full h-[280px] object-cover rounded-lg"
        />
      )}

      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
        <button
          onClick={() => setShowVideo(false)}
          className={`flex items-center justify-center w-6 h-6 rounded-full ${!showVideo ? "bg-white text-black" : "text-white"}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-white text-xs font-medium">{showVideo ? "Vídeo" : "Foto"}</span>

        <button
          onClick={() => setShowVideo(true)}
          className={`flex items-center justify-center w-6 h-6 rounded-full ${showVideo ? "bg-white text-black" : "text-white"}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

