"use client"

import type React from "react"
import { memo, useCallback, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface InfoHotspotFormProps {
  hotspotManager: ReturnType<typeof import("../hooks/useHotspotManager").useHotspotManager>
}

const InfoHotspotForm: React.FC<InfoHotspotFormProps> = memo(({ hotspotManager }) => {
  const { setShowInfoForm, infoTitle, setInfoTitle, infoText, setInfoText, setIsAddingHotspot } = hotspotManager
  
  // Use local state to prevent re-renders of parent components
  const [localInfoTitle, setLocalInfoTitle] = useState(infoTitle)
  const [localInfoText, setLocalInfoText] = useState(infoText)

  const handleCancel = useCallback(() => {
    setShowInfoForm(false)
    setInfoTitle("")
    setInfoText("")
    setIsAddingHotspot(false)
  }, [setShowInfoForm, setInfoTitle, setInfoText, setIsAddingHotspot])

  const handleContinue = useCallback(() => {
    if (localInfoTitle && localInfoText) {
      // Only update the parent state when submitting
      setInfoTitle(localInfoTitle)
      setInfoText(localInfoText)
      setShowInfoForm(false)
    } else {
      alert("Bitte fülle alle Felder aus.")
    }
  }, [localInfoTitle, localInfoText, setInfoTitle, setInfoText, setShowInfoForm])

  // Local handlers that don't affect parent component
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInfoTitle(e.target.value)
  }, [])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalInfoText(e.target.value)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Info-Hotspot hinzufügen</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="infoTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Titel
            </label>
            <input
              type="text"
              id="infoTitle"
              value={localInfoTitle}
              onChange={handleTitleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Titel der Information"
            />
          </div>
          <div>
            <label htmlFor="infoText" className="block text-sm font-medium text-gray-700 mb-1">
              Text
            </label>
            <textarea
              id="infoText"
              value={localInfoText}
              onChange={handleTextChange}
              className="w-full p-2 border rounded-md h-32"
              placeholder="Beschreibungstext"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!localInfoTitle || !localInfoText}
          >
            Weiter
          </Button>
        </div>
      </div>
    </div>
  )
})

InfoHotspotForm.displayName = "InfoHotspotForm"

export default InfoHotspotForm