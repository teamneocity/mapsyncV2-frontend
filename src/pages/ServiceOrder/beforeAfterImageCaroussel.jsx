"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function BeforeAfterImageCarousel({ beforeImages = [], afterImages = [] }) {
  const [currentTab, setCurrentTab] = useState("before") // 'before' or 'after'
  const [currentIndex, setCurrentIndex] = useState(0)
  const baseUrl = "https://imag3semurb.nyc3.cdn.digitaloceanspaces.com"

  const currentImages = currentTab === "before" ? beforeImages : afterImages

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1))
  }

  if (beforeImages.length === 0 && afterImages.length === 0) return null

  return (
    <div className="relative w-full">
      {/* Tabs para alternar entre Antes e Depois */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 font-medium ${
            currentTab === "before" ? "text-primary border-b-2 border-primary" : "text-gray-500"
          }`}
          onClick={() => {
            setCurrentTab("before")
            setCurrentIndex(0)
          }}
        >
          Antes
        </button>
        <button
          className={`flex-1 py-2 font-medium ${
            currentTab === "after" ? "text-primary border-b-2 border-primary" : "text-gray-500"
          }`}
          onClick={() => {
            setCurrentTab("after")
            setCurrentIndex(0)
          }}
        >
          Depois
        </button>
      </div>

      {/* Área de imagem + botões de navegação */}
      <div className="relative w-full h-80 rounded-lg bg-gray-100">
        {/* Imagem com overflow controlado */}
        <div className="w-full h-full overflow-hidden rounded-lg">
          {currentImages.length > 0 ? (
            <img
              src={`${baseUrl}/${currentImages[currentIndex]?.path || currentImages[currentIndex]}`}
              alt={`${currentTab} ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Nenhuma imagem disponível</p>
            </div>
          )}
        </div>

        {/* Botões e contador fora do overflow */}
        {currentImages.length > 1 && (
          <>
            {/* Botões laterais */}
            <div className="absolute inset-0 flex justify-between items-center px-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="bg-black/50 rounded-full p-1 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="bg-black/50 rounded-full p-1 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Contador */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded-full px-3 py-1">
              {currentIndex + 1} / {currentImages.length}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
