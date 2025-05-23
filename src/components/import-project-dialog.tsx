"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, FileUp, AlertCircle } from "lucide-react"
import { useProjectImport } from "../lib/import-utils"
import { useNavigate } from "react-router-dom"

interface ImportProjectDialogProps {
  isOpen: boolean
  onClose: () => void
}

const ImportProjectDialog: React.FC<ImportProjectDialogProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isImporting, importError, handleImport } = useProjectImport()
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith(".zip")) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleImportClick = async () => {
    if (!file) return

    const importedProject = await handleImport(file)
    if (importedProject) {
      onClose()
      navigate(`/project/${importedProject.id}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Project</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
            ${file ? "border-green-500 bg-green-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip" className="hidden" />

          {file ? (
            <>
              <FileUp className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
              <p className="mt-1 text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">
                {isDragging ? "Drop ZIP file here" : "Drag and drop a ZIP file or click to browse"}
              </p>
              <p className="mt-1 text-xs text-gray-500">Only ZIP files containing exported projects are supported</p>
            </>
          )}
        </div>

        {importError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-red-700">{importError}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            onClick={handleImportClick}
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Importing...
              </>
            ) : (
              "Import Project"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportProjectDialog
