"use client"

import { Project, ProjectImage } from "@/types"
import type React from "react"
import { memo } from "react"

interface PanoramaListProps {
  project: Project
  selectedPanorama: ProjectImage | null
  setSelectedPanorama: (panorama: ProjectImage) => void
  isAddingHotspot: boolean
  hotspotType: string
  targetPanorama: ProjectImage | null
  setTargetPanorama: (panorama: ProjectImage | null) => void
}

// Using React.memo to prevent unnecessary re-renders
const PanoramaList: React.FC<PanoramaListProps> = memo(
  ({
    project,
    selectedPanorama,
    setSelectedPanorama,
    isAddingHotspot,
    hotspotType,
    targetPanorama,
    setTargetPanorama,
  }) => {
    return (
      <div className="w-64 border-l bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Panoramas</h2>
          <div className="space-y-4">
            {project.panoramas.map((image) => (
              <div
                key={image.id}
                onClick={() => {
                  if (
                    isAddingHotspot &&
                    hotspotType === "navigation" &&
                    !targetPanorama &&
                    image.id !== selectedPanorama?.id
                  ) {
                    setTargetPanorama(image)
                  } else if (!isAddingHotspot) {
                    setSelectedPanorama(image)
                  }
                }}
                className={`
                  relative rounded-lg overflow-hidden cursor-pointer
                  ${selectedPanorama?.id === image.id ? "ring-8 ring-blue-500" : ""}
                  ${targetPanorama?.id === image.id ? "ring-8 ring-green-500" : ""}
                  ${
                    isAddingHotspot && !targetPanorama && selectedPanorama?.id !== image.id
                      ? "hover:ring-8 hover:ring-green-700"
                      : ""
                  }
                  ${!isAddingHotspot ? "hover:ring-8 hover:ring-blue-700" : ""}
                `}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt="Panorama thumbnail"
                  className="w-full h-32 object-cover"
                />
                {isAddingHotspot &&
                  !targetPanorama &&
                  selectedPanorama?.id === image.id &&
                  hotspotType === "navigation" && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Source</p>
                    </div>
                  )}
                {isAddingHotspot && targetPanorama?.id === image.id && hotspotType === "navigation" && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Target</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
)

PanoramaList.displayName = "PanoramaList"

export default PanoramaList
