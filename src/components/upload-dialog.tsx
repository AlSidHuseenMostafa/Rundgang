"use client"

import type React from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import UploadArea from "./upload-area"

interface UploadDialogProps {
  uploadManager: ReturnType<typeof import("../hooks/useUploadManager").useUploadManager>
}

const UploadDialog: React.FC<UploadDialogProps> = ({ uploadManager }) => {
  const { uploadType, uploadError, handleFileSelect, setShowUpload } = uploadManager

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {uploadType === "panorama" ? "Panorama" : uploadType === "image" ? "Bild" : "Video"} hochladen
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
            <X size={20} />
          </Button>
        </div>
        <UploadArea
          onFileSelect={handleFileSelect}
          acceptType={uploadType === "video" ? "video/*" : "image/*"}
          uploadType={uploadType}
        />
        {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setShowUpload(false)}>
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UploadDialog
