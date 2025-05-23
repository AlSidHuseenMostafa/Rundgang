"use client"

import type React from "react"
import { Info } from "lucide-react"
import { Button } from "./ui/button"
import type { Hotspot } from "../types"

interface InfoHotspotModalProps {
  hotspot: Hotspot
  onClose: () => void
}

const InfoHotspotModal: React.FC<InfoHotspotModalProps> = ({ hotspot, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <Info className="text-yellow-500 mr-2" />
          <h3 className="text-xl font-semibold">{hotspot.title}</h3>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{hotspot.text}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InfoHotspotModal
