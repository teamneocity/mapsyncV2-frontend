"use client"

import { useState, useCallback } from "react"
import { CloudIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProfileUpload({ onFileChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setFile(file)
        onFileChange(file)
      }
    }
  }, [])

  const handleFileChange = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setFile(file)
        onFileChange(file)
      }
    }
  }, [onFileChange])

  const validateFile = (file) => {
    const validTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (SVG, PNG, JPG, or GIF)")
      return false
    }

    // Create an image object to check dimensions
    const img = new Image()
    img.src = URL.createObjectURL(file)

    return new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        if (img.width > 800 || img.height > 400) {
          alert("Image dimensions must be 800×400px or smaller")
          resolve(false)
        }
        resolve(true)
      }
    })
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-[170px] border border-gray-200 rounded-lg cursor-pointer",
        "transition-colors duration-200",
        isDragging && "border-gray-400 bg-gray-50",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept=".svg,.png,.jpg,.jpeg,.gif"
      />
      <CloudIcon className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-600">
        Click to upload <span className="text-gray-400">or drag and drop</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG, or GIF (max 800×400px)</p>
    </div>
  )
}

