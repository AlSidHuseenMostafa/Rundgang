"use client"

import type React from "react"
import { Plus, LinkIcon, ImageIcon, Video, InfoIcon, ExternalLink, YoutubeIcon, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { ProjectImage } from "../types"

interface HotspotControlsProps {
  selectedPanorama: ProjectImage | null
  hotspotManager: ReturnType<typeof import("../hooks/useHotspotManager").useHotspotManager>
  uploadManager: ReturnType<typeof import("../hooks/useUploadManager").useUploadManager>
}

const HotspotControls: React.FC<HotspotControlsProps> = ({ selectedPanorama, hotspotManager, uploadManager }) => {
  const {
    isAddingHotspot,
    hotspotType,
    targetPanorama,
    selectedMedia,
    infoTitle,
    infoText,
    urlLink,
    iframeLink,
    startAddingHotspot,
    cancelHotspotAddition,
  } = hotspotManager

  return (
    <>
      {/* Add Media Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={20} />
            Hinzufügen
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => uploadManager.startUpload("panorama")}>
            <div className="flex items-center gap-2">
              <Plus size={16} />
              Panorama hinzufügen
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => uploadManager.startUpload("image")}>
            <div className="flex items-center gap-2">
              <ImageIcon size={16} />
              Bild hinzufügen
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => uploadManager.startUpload("video")}>
            <div className="flex items-center gap-2">
              <Video size={16} />
              Video hinzufügen
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Hotspot Dropdown */}
      {selectedPanorama && !isAddingHotspot && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <LinkIcon size={20} />
              Hotspot hinzufügen
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => startAddingHotspot("link")}>
              <div className="flex items-center gap-2">
                <ExternalLink size={16} />
                Link-Hotspot hinzufügen
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAddingHotspot("image")}>
              <div className="flex items-center gap-2">
                <ImageIcon size={16} />
                Bild-Hotspot hinzufügen
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAddingHotspot("video")}>
              <div className="flex items-center gap-2">
                <Video size={16} />
                Video-Hotspot hinzufügen
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAddingHotspot("navigation")}>
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                Navigation-Hotspot hinzufügen
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAddingHotspot("info")}>
              <div className="flex items-center gap-2">
                <InfoIcon size={16} />
                Info-Hotspot hinzufügen
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAddingHotspot("iframe")}>
              <div className="flex items-center gap-2">
                <YoutubeIcon size={16} />
                Iframe-Hotspot hinzufügen
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Hotspot Status Messages */}
      {isAddingHotspot && hotspotType === "navigation" && !targetPanorama && (
        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">Wähle ein Ziel-Panorama aus der Liste →</div>
      )}

      {isAddingHotspot && hotspotType === "navigation" && targetPanorama && (
        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">Platziere den Hotspot auf dem Panorama</div>
      )}

      {isAddingHotspot && (hotspotType === "image" || hotspotType === "video") && !selectedMedia && (
        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
          Wähle ein {hotspotType === "image" ? "Bild" : "Video"} aus dem Dialog
        </div>
      )}

      {isAddingHotspot && (hotspotType === "image" || hotspotType === "video") && selectedMedia && (
        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">Platziere den Hotspot auf dem Panorama</div>
      )}

      {isAddingHotspot &&
        ((hotspotType === "info" && infoTitle && infoText) ||
          (hotspotType === "link" && urlLink) ||
          (hotspotType === "iframe" && iframeLink)) && (
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">Platziere den Hotspot auf dem Panorama</div>
        )}

      {isAddingHotspot && (
        <Button variant="destructive" onClick={cancelHotspotAddition}>
          Abbrechen
        </Button>
      )}
    </>
  )
}

export default HotspotControls
