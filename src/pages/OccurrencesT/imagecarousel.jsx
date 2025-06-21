"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

export function ImageCarousel({ occurrence, onDeleteImage }) {
  const images = occurrence?.photo_land_occurrences || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState("1")
  const totalImages = images.length

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setInputValue((newIndex + 1).toString())
  }

  const handleNext = () => {
    const newIndex = currentIndex === totalImages - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    setInputValue((newIndex + 1).toString())
  }

  const handleInputChange = (e) => setInputValue(e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue) && numValue >= 1 && numValue <= totalImages) {
      setCurrentIndex(numValue - 1)
    } else {
      setInputValue((currentIndex + 1).toString())
    }
  }

  const handleDelete = () => {
    if (totalImages === 0) return
    const currentImage = images[currentIndex]
    if (onDeleteImage) {
      onDeleteImage(currentImage, occurrence.id)
    }
  }

  const currentImagePath = images[currentIndex]?.path || occurrence?.photo_start

  if (totalImages === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full text-sm text-gray-500">
        Nenhuma imagem disponível
      </div>
    )
  }

  return (
    <div className="relative w-full h-full max-h-[350px] rounded-lg overflow-hidden">
      <img
        src={`https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${currentImagePath}`}
        alt="Imagem da ocorrência"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-x-0 bottom-4 flex justify-between items-center px-4">
        <button onClick={handlePrevious} className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          Anterior
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
        >
          <Trash2 size={16} />
          Deletar
        </button>

        <form onSubmit={handleSubmit} className="flex items-center bg-black/60 rounded-full px-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleSubmit}
            className="w-8 bg-transparent text-white text-center outline-none"
          />
          <span className="text-white">/</span>
          <span className="text-white px-2">{totalImages}</span>
        </form>

        <button onClick={handleNext} className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          Próxima
        </button>
      </div>
    </div>
  )
}
