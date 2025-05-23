"use client"

import { useState, useEffect } from "react"

export default function Navbar() {
  // State for accessibility features
  const [highContrast, setHighContrast] = useState(false)
  const [largeFont, setLargeFont] = useState(false)
  const [easyLanguage, setEasyLanguage] = useState(false)

  // Toggle high contrast mode
  const toggleContrast = () => {
    const newContrastValue = !highContrast
    setHighContrast(newContrastValue)

    // Apply contrast effect to the document
    if (newContrastValue) {
      document.body.classList.add("high-contrast-mode")
    } else {
      document.body.classList.remove("high-contrast-mode")
    }

    // Save preference to localStorage
    localStorage.setItem("highContrast", newContrastValue.toString())
  }

  // Toggle large font size
  const toggleFontSize = () => {
    const newFontValue = !largeFont
    setLargeFont(newFontValue)

    // Apply font size effect to the document
    if (newFontValue) {
      document.body.classList.add("large-font-mode")
    } else {
      document.body.classList.remove("large-font-mode")
    }

    // Save preference to localStorage
    localStorage.setItem("largeFont", newFontValue.toString())
  }

  // Toggle easy language
  const toggleEasyLanguage = () => {
    const newEasyLanguageValue = !easyLanguage
    setEasyLanguage(newEasyLanguageValue)

    // Apply easy language effect
    if (newEasyLanguageValue) {
      document.body.classList.add("easy-language-mode")
      // Here you would typically load alternative text content
    } else {
      document.body.classList.remove("easy-language-mode")
    }

    // Save preference to localStorage
    localStorage.setItem("easyLanguage", newEasyLanguageValue.toString())
  }

  // Load saved preferences on component mount
  useEffect(() => {
    // Get saved preferences from localStorage
    const savedContrast = localStorage.getItem("highContrast") === "true"
    const savedFontSize = localStorage.getItem("largeFont") === "true"
    const savedEasyLanguage = localStorage.getItem("easyLanguage") === "true"

    // Set states based on saved preferences
    setHighContrast(savedContrast)
    setLargeFont(savedFontSize)
    setEasyLanguage(savedEasyLanguage)

    // Apply effects based on saved preferences
    if (savedContrast) document.body.classList.add("high-contrast-mode")
    if (savedFontSize) document.body.classList.add("large-font-mode")
    if (savedEasyLanguage) document.body.classList.add("easy-language-mode")
  }, [])

  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Barrierefreiheit</h1>
        <div className="flex gap-4">
          <button
            onClick={toggleContrast}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              highContrast ? "bg-blue-500 text-white" : "bg-blue-100 hover:bg-blue-200"
            }`}
            aria-pressed={highContrast}
          >
            Kontrast
          </button>
          <button
            onClick={toggleFontSize}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              largeFont ? "bg-blue-500 text-white" : "bg-blue-100 hover:bg-blue-200"
            }`}
            aria-pressed={largeFont}
          >
            Schriftgröße
          </button>
          <button
            onClick={toggleEasyLanguage}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              easyLanguage ? "bg-blue-500 text-white" : "bg-blue-100 hover:bg-blue-200"
            }`}
            aria-pressed={easyLanguage}
          >
            Leichte Sprache
          </button>
        </div>
      </div>
    </nav>
  )
}
