"use client"

import type React from "react"
import { X, Video } from "lucide-react"
import { Button } from "./ui/button"
import type { Project } from "../types"

interface MediaSelectorDialogProps {
  project: Project
  hotspotManager: ReturnType<typeof import("../hooks/useHotspotManager").useHotspotManager>
}

const MediaSelectorDialog: React.FC<MediaSelectorDialogProps> = ({ project, hotspotManager }) => {
  const { hotspotType, selectedMedia, setSelectedMedia, setShowMediaSelector, setIsAddingHotspot } = hotspotManager

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{hotspotType === "image" ? "Bild" : "Video"} auswählen</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowMediaSelector(false)
              setSelectedMedia(null)
              setIsAddingHotspot(false)
            }}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {hotspotType === "image" ? (
            project.images.length > 0 ? (
              project.images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => {
                    setSelectedMedia(image)
                    setShowMediaSelector(false)
                  }}
                  className={`
                    relative rounded-lg overflow-hidden cursor-pointer
                    ${selectedMedia === image ? "ring-2 ring-blue-500" : ""}
                    hover:ring-2 hover:ring-blue-500
                  `}
                >
                  <img src={image.url || "/placeholder.svg"} alt="Bild" className="w-full h-32 object-cover" />
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-500 py-8">
                Keine Bilder verfügbar. Lade zuerst Bilder hoch.
              </p>
            )
          ) : project.videos.length > 0 ? (
            project.videos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  setSelectedMedia(video)
                  setShowMediaSelector(false)
                }}
                className={`
                  relative rounded-lg overflow-hidden cursor-pointer
                  ${selectedMedia === video ? "ring-2 ring-blue-500" : ""}
                  hover:ring-2 hover:ring-blue-500
                `}
              >
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-500" />
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500 py-8">
              Keine Videos verfügbar. Lade zuerst Videos hoch.
            </p>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {selectedMedia && (
            <Button
              onClick={() => {
                setShowMediaSelector(false)
              }}
            >
              Auswählen
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setShowMediaSelector(false)
              setSelectedMedia(null)
              setIsAddingHotspot(false)
            }}
          >
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MediaSelectorDialog
