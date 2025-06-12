"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

export function ConcludeServiceOrderModal({ isOpen, onClose, onConfirm, message }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const MAX_IMAGES = 5

  const handleFileChange = useCallback(
    (selectedFiles) => {
      if (selectedFiles && selectedFiles.length > 0) {
        // Convert FileList to Array for easier manipulation
        const filesArray = Array.from(selectedFiles)

        // Only accept image files
        const imageFiles = filesArray.filter((file) => file.type.startsWith("image/"))

        // Limit to maximum 5 images total
        const newFiles = [...files, ...imageFiles].slice(0, MAX_IMAGES)
        setFiles(newFiles)

        // Create object URLs for previews
        const newPreviews = newFiles.map((file) => {
          // If this file already has a preview, reuse it
          const existingPreviewIndex = files.findIndex((f) => f === file)
          if (existingPreviewIndex >= 0) {
            return previews[existingPreviewIndex]
          }
          // Otherwise create a new preview
          return URL.createObjectURL(file)
        })

        setPreviews(newPreviews)
      }
    },
    [files, previews],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files)
      }
    },
    [handleFileChange],
  )

  const handleInputChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileChange(e.target.files)
      }
    },
    [handleFileChange],
  )

  const handleRemoveFile = useCallback((index) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles]
      newFiles.splice(index, 1)
      return newFiles
    })

    setPreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews]
      URL.revokeObjectURL(newPreviews[index])
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }, [])

  const handleConfirm = useCallback(() => {
    onConfirm(files)
    onClose()
  }, [files, onConfirm, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">{message}</h2>

          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              {files.length} de {MAX_IMAGES} imagens
            </p>
            {files.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  // Revoke all object URLs
                  previews.forEach((preview) => URL.revokeObjectURL(preview))
                  setFiles([])
                  setPreviews([])
                }}
              >
                Limpar tudo
              </Button>
            )}
          </div>

          {/* Preview grid for multiple images */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile(index)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {files.length < MAX_IMAGES && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                isDragging ? "border-primary bg-primary/10" : "border-gray-300"
              } flex flex-col items-center justify-center cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload").click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleInputChange}
              />

              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                <span className="font-medium text-primary">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG E JPG até 10MB</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleConfirm} disabled={files.length === 0}>
              Confirmar
            </Button>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
