import type React from "react"
import { useState } from "react"
import { Upload, AlertCircle } from "lucide-react"

interface UploadAreaProps {
  onFileSelect: (file: File) => void
  acceptType?: string
  uploadType?: "panorama" | "image" | "video"
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 10MB

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, acceptType = "image/*", uploadType = "panorama" }) => {
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = (file: File) => {
    setError(null)

    // Prüfe, ob die Datei existiert
    if (!file) {
      setError("Keine Datei ausgewählt")
      return false
    }

    // Prüfe, ob file.type existiert
    if (!file.type) {
      setError("Dateityp konnte nicht erkannt werden")
      return false
    }

    if (uploadType === "panorama" || uploadType === "image") {
      if (!file.type.startsWith("image/")) {
        setError("Bitte lade eine Bilddatei hoch")
        return false
      }
    } else if (uploadType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Bitte lade eine Videodatei hoch")
        return false
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Dateigröße muss kleiner als 10MB sein")
      return false
    }

    return true
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0])
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        error
          ? "border-red-300 bg-red-50"
          : isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-500"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      <input type="file" id="fileInput" className="hidden" accept={acceptType} onChange={handleFileInput} />
      {error ? (
        <div className="text-red-500">
          <AlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Ziehe dein {uploadType === "panorama" ? "360°" : uploadType === "image" ? "Bild" : "Video"} hierher oder
            klicke, um eine Datei auszuwählen
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {uploadType === "video" ? "Unterstützt: MP4, WebM (max 10MB)" : "Unterstützt: JPG, PNG (max 10MB)"}
          </p>
        </>
      )}
    </div>
  )
}

export default UploadArea