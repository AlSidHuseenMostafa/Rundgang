"use client"

import type React from "react"
import { memo, useCallback, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface IframeHotspotFormProps {
  hotspotManager: ReturnType<typeof import("../hooks/useHotspotManager").useHotspotManager>
}

const IframeHotspotForm: React.FC<IframeHotspotFormProps> = memo(({ hotspotManager }) => {
  const { setShowIframeForm, iframeLink, setIframeLink, setIsAddingHotspot } = hotspotManager
  
  // Use local state to prevent re-renders of parent components
  const [localIframeLink, setLocalIframeLink] = useState(iframeLink)

  const handleCancel = useCallback(() => {
    setShowIframeForm(false)
    setIframeLink("")
    setIsAddingHotspot(false)
  }, [setShowIframeForm, setIframeLink, setIsAddingHotspot])

  const handleContinue = useCallback(() => {
    if (localIframeLink) {
      // Only update the parent state when needed
      setIframeLink(localIframeLink)
      setShowIframeForm(false)
    } else {
      alert("Bitte gib einen YouTube-Link ein.")
    }
  }, [localIframeLink, setIframeLink, setShowIframeForm])

  // Local state change handler won't trigger parent re-renders
  const handleLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalIframeLink(e.target.value)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">YouTube-Hotspot hinzufügen</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <X size={20} />
          </Button>
        </div>
        <div>
          <label htmlFor="iframeLink" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube-Link
          </label>
          <input
            type="url"
            id="iframeLink"
            value={localIframeLink}
            onChange={handleLinkChange}
            className="w-full p-2 border rounded-md"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Füge einen YouTube-Link ein (z.B. https://www.youtube.com/watch?v=abcdefg oder https://youtu.be/abcdefg)
          </p>
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
            disabled={!localIframeLink}
          >
            Weiter
          </Button>
        </div>
      </div>
    </div>
  )
})

IframeHotspotForm.displayName = "IframeHotspotForm"

export default IframeHotspotForm