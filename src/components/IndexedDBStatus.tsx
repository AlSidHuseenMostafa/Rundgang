import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

const IndexedDBStatus: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "supported" | "unsupported">("checking")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkIndexedDB = () => {
      if (!window.indexedDB) {
        setStatus("unsupported")
        setError("Dein Browser unterstützt IndexedDB nicht.")
        return
      }

      try {
        const request = indexedDB.open("test-db", 1)

        request.onerror = (event) => {
          setStatus("unsupported")
          setError(
            "IndexedDB konnte nicht initialisiert werden. Möglicherweise ist der private Modus aktiviert oder Cookies sind deaktiviert.",
          )
        }

        request.onsuccess = (event) => {
          setStatus("supported")
          // Schließe und lösche die Test-Datenbank
          request.result.close()
          indexedDB.deleteDatabase("test-db")
        }
      } catch (err) {
        setStatus("unsupported")
        setError("Ein unerwarteter Fehler ist aufgetreten.")
      }
    }

    checkIndexedDB()
  }, [])

  if (status === "checking") {
    return null
  }

  if (status === "unsupported") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">IndexedDB wird nicht unterstützt</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                {error ||
                  "Dein Browser unterstützt IndexedDB nicht, was für die Speicherung großer Datenmengen benötigt wird."}
              </p>
              <p className="mt-1">Bitte verwende einen modernen Browser wie Chrome, Firefox, Safari oder Edge.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default IndexedDBStatus