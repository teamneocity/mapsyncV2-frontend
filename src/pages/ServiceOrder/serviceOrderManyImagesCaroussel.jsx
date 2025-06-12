"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function ServiceOrderManyImagesCaroussel({ imagePaths, altTexts = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const baseUrl = "https://imag3semurb.nyc3.cdn.digitaloceanspaces.com"

  // Handle empty array case
  if (!imagePaths || imagePaths.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imagePaths.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imagePaths.length - 1 ? 0 : prevIndex + 1))
  }

  // Get alt text for current image or use default
  const currentAltText = altTexts[currentIndex] || `Image ${currentIndex + 1}`

  // Construct the full image URL
  const currentImageUrl = `${baseUrl}/${imagePaths[currentIndex]}`

  return (
    <div className="relative">
      <img
        src={currentImageUrl || "/placeholder.svg"}
        alt={currentAltText}
        className="w-full h-[280px] object-cover rounded-lg"
      />

      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
        <button
          onClick={goToPrevious}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4 text-white" />
        </button>

        <span className="text-white text-xs font-medium">
          {currentIndex + 1} / {imagePaths.length}
        </span>

        <button
          onClick={goToNext}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  )
}
