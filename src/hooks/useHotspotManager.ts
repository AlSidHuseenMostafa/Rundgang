'use client'

import { useState, useCallback } from 'react'
import type { RegularImage, ProjectImage, Video } from '../types'
import { useProjectStore } from '../store/projectStore'

type HotspotType = 'link' | 'image' | 'video' | 'navigation' | 'info' | 'iframe'

export const useHotspotManager = (
  projectId: string,
  selectedPanorama: ProjectImage | null,
  onHotspotAdded?: () => void // Neuer Callback Parameter
) => {
  const [isAddingHotspot, setIsAddingHotspot] = useState(false)
  const [hotspotType, setHotspotType] = useState<HotspotType>('link')
  const [targetPanorama, setTargetPanorama] = useState<ProjectImage | null>(
    null
  )
  const [selectedMedia, setSelectedMedia] = useState<
    RegularImage | Video | null
  >(null)
  const [showMediaSelector, setShowMediaSelector] = useState(false)

  // Info hotspot state
  const [showInfoForm, setShowInfoForm] = useState(false)
  const [infoTitle, setInfoTitle] = useState('')
  const [infoText, setInfoText] = useState('')

  // URL hotspot state
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [urlLink, setUrlLink] = useState('')

  // Iframe hotspot state
  const [showIframeForm, setShowIframeForm] = useState(false)
  const [iframeLink, setIframeLink] = useState('')

  const {
    addHotspot,
    addImageHotspot,
    addVideoHotspot,
    addInfoHotspot,
    addUrlHotspot,
    addIframeHotspot,
  } = useProjectStore()

  const startAddingHotspot = useCallback((type: HotspotType) => {
    setIsAddingHotspot(true)
    setHotspotType(type)
    setTargetPanorama(null)
    setSelectedMedia(null)

    if (type === 'image' || type === 'video') {
      setShowMediaSelector(true)
    } else if (type === 'info') {
      setShowInfoForm(true)
    } else if (type === 'link') {
      setShowUrlForm(true)
    } else if (type === 'iframe') {
      setShowIframeForm(true)
    }
  }, [])

  const cancelHotspotAddition = useCallback(() => {
    setIsAddingHotspot(false)
    setTargetPanorama(null)
    setShowMediaSelector(false)
    setSelectedMedia(null)
    setShowInfoForm(false)
    setInfoTitle('')
    setInfoText('')
    setShowUrlForm(false)
    setUrlLink('')
    setShowIframeForm(false)
    setIframeLink('')
  }, [])

  const handleHotspotPosition = useCallback(
    (longitude: number, latitude: number, type: string) => {
      if (!selectedPanorama || !projectId) return

      let hotspotAdded = false

      if (type === 'navigation' && targetPanorama) {
        addHotspot(projectId, selectedPanorama.id, {
          targetId: targetPanorama.id,
          longitude,
          latitude,
          type: type,
        })
        hotspotAdded = true

        setIsAddingHotspot(false)
        setTargetPanorama(null)
      } else if (type === 'image' && selectedMedia) {
        addImageHotspot(
          projectId,
          selectedPanorama.id,
          selectedMedia as RegularImage,
          longitude,
          latitude,
          'image'
        )
        hotspotAdded = true
        setIsAddingHotspot(false)
        setSelectedMedia(null)
      } else if (type === 'video' && selectedMedia) {
        addVideoHotspot(
          projectId,
          selectedPanorama.id,
          selectedMedia as Video,
          longitude,
          latitude,
          'video'
        )
        hotspotAdded = true
        setIsAddingHotspot(false)
        setSelectedMedia(null)
      } else if (type === 'info' && infoTitle && infoText) {
        addInfoHotspot(
          projectId,
          selectedPanorama.id,
          infoTitle,
          infoText,
          longitude,
          latitude
        )
        hotspotAdded = true
        setIsAddingHotspot(false)
        setShowInfoForm(false)
        setInfoTitle('')
        setInfoText('')
      } else if (type === 'link' && urlLink) {
        addUrlHotspot(
          projectId,
          selectedPanorama.id,
          urlLink,
          longitude,
          latitude
        )
        hotspotAdded = true
        setIsAddingHotspot(false)
        setShowUrlForm(false)
        setUrlLink('')
      } else if (type === 'iframe' && iframeLink) {
        // Convert YouTube links to embed links
        let embedLink = iframeLink
        if (iframeLink.includes('youtube.com/watch?v=')) {
          const videoId = iframeLink.split('v=')[1].split('&')[0]
          embedLink = `https://www.youtube.com/embed/${videoId}`
        } else if (iframeLink.includes('youtu.be/')) {
          const videoId = iframeLink.split('youtu.be/')[1].split('?')[0]
          embedLink = `https://www.youtube.com/embed/${videoId}`
        }

        addIframeHotspot(
          projectId,
          selectedPanorama.id,
          embedLink,
          longitude,
          latitude
        )
        hotspotAdded = true
        setIsAddingHotspot(false)
        setShowIframeForm(false)
        setIframeLink('')
      }

      // Call the callback at the end if a hotspot was added
      if (hotspotAdded && onHotspotAdded) {
        console.log('Calling onHotspotAdded callback')
        // Use setTimeout to ensure state updates have been processed
        setTimeout(() => {
          onHotspotAdded()
        }, 0)
      }
    },
    [
      projectId,
      selectedPanorama,
      targetPanorama,
      selectedMedia,
      infoTitle,
      infoText,
      urlLink,
      iframeLink,
      addHotspot,
      addImageHotspot,
      addVideoHotspot,
      addInfoHotspot,
      addUrlHotspot,
      addIframeHotspot,
      onHotspotAdded,
    ]
  )

  return {
    isAddingHotspot,
    setIsAddingHotspot,
    hotspotType,
    targetPanorama,
    setTargetPanorama,
    selectedMedia,
    setSelectedMedia,
    showMediaSelector,
    setShowMediaSelector,
    showInfoForm,
    setShowInfoForm,
    infoTitle,
    setInfoTitle,
    infoText,
    setInfoText,
    showUrlForm,
    setShowUrlForm,
    urlLink,
    setUrlLink,
    showIframeForm,
    setShowIframeForm,
    iframeLink,
    setIframeLink,
    startAddingHotspot,
    cancelHotspotAddition,
    handleHotspotPosition,
  }
}