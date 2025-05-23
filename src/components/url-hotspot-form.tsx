"use client"

import type React from "react"
import { memo, useCallback, useState } from "react"
import { X } from "lucide-react"

interface UrlHotspotFormProps {
  hotspotManager: ReturnType<typeof import("../hooks/useHotspotManager").useHotspotManager>
}

// Using React.memo to prevent unnecessary re-renders
const UrlHotspotForm: React.FC<UrlHotspotFormProps> = memo(({ hotspotManager }) => {
  const { setShowUrlForm, urlLink, setUrlLink, setIsAddingHotspot } = hotspotManager
  
  // Use local state to avoid re-renders of parent components
  const [localUrlLink, setLocalUrlLink] = useState(urlLink)

  // Use useCallback to memoize event handlers
  const handleCancel = useCallback(() => {
    setShowUrlForm(false)
    setUrlLink("")
    setIsAddingHotspot(false)
  }, [setShowUrlForm, setUrlLink, setIsAddingHotspot])

  const handleContinue = useCallback(() => {
    if (localUrlLink) {
      // Add https:// if missing
      let finalUrl = localUrlLink
      if (!localUrlLink.startsWith("http://") && !localUrlLink.startsWith("https://")) {
        finalUrl = `https://${localUrlLink}`
      }
      // Only update parent state when continuing
      setUrlLink(finalUrl)
      setShowUrlForm(false)
    } else {
      alert("Bitte gib eine URL ein.")
    }
  }, [localUrlLink, setUrlLink, setShowUrlForm])

  // Handle local state changes without affecting parent component
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalUrlLink(e.target.value)
    },
    []
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">URL-Hotspot hinzufügen</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>
        <div>
          <label htmlFor="urlLink" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            id="urlLink"
            value={localUrlLink}
            onChange={handleUrlChange}
            className="w-full p-2 border rounded-md"
            placeholder="https://example.com"
          />
          <p className="mt-1 text-sm text-gray-500">Gib eine vollständige URL ein (mit https://)</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={handleCancel}>
            Abbrechen
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleContinue}
            disabled={!localUrlLink}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
})

UrlHotspotForm.displayName = "UrlHotspotForm"

export default UrlHotspotForm