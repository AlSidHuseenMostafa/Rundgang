"use client"

import type React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"

interface UploadAreaProps {
  onFileSelect: (file: File) => void
  acceptType: string
  uploadType: "panorama" | "image" | "video"
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, acceptType, uploadType }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [acceptType]: [],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-900">
        {isDragActive
          ? `Datei hier ablegen...`
          : `${
              uploadType === "panorama" ? "Panorama" : uploadType === "image" ? "Bild" : "Video"
            } hierher ziehen oder klicken zum Auswählen`}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {uploadType === "panorama" || uploadType === "image" ? "JPG, PNG oder WEBP" : "MP4, WEBM oder OGG"}
      </p>
    </div>
  )
}

export default UploadArea
