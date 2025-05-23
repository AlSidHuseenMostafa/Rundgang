'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import {
  MarkersPlugin,
  type MarkersPluginConfig,
  type Marker,
} from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import { AlertCircle } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import type { ProjectImage, Hotspot } from '../types'
import InfoHotspotModal from './info-hotspot-modal'

interface PanoramaViewerProps {
  image: ProjectImage
  isAddingHotspot?: boolean
  hotspotType?: 'link' | 'image' | 'video' | 'navigation' | 'info' | 'iframe'
  projectId?: string
  onHotspotPosition?: (
    longitude: number,
    latitude: number,
    type: string
  ) => void
  setSelectedPanorama: (panorama: ProjectImage) => void
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  image,
  isAddingHotspot,
  hotspotType,
  projectId,
  onHotspotPosition,
  setSelectedPanorama,
}) => {
  console.log(
    'PanoramaViewer rendering with image:',
    image.id,
    'hotspots:',
    image.hotspots?.length
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const markersPluginRef = useRef<any | null>(null)
  const [error, setError] = useState(false)
  const { getProject } = useProjectStore()
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)

  // Always destroy and recreate the viewer when the component renders
  useEffect(() => {
    console.log(
      'Setting up viewer for image:',
      image.id,
      'with hotspots:',
      image.hotspots?.length
    )

    // Clean up any existing viewer
    if (viewerRef.current) {
      console.log('Destroying existing viewer')
      viewerRef.current.destroy()
      viewerRef.current = null
    }

    let mounted = true

    const iframeContainer = document.createElement('container')
    if (image.hotspots && image.hotspots.length > 0) {
      image.hotspots.forEach((hotspot: Hotspot) => {
        if (hotspot.type === 'iframe') {
          const iframe = document.createElement('iframe')
          iframe.id = hotspot.id
          iframe.src = hotspot.url || ''
          iframe.width = '640px'
          iframe.style.aspectRatio = `${16 / 9}`
          iframe.style.border = 'none'
          iframe.allow = 'fullscreen'
          iframeContainer.appendChild(iframe)
        }
      })
    }

    const infoContainer = document.createElement('container')
    if (image.hotspots && image.hotspots.length > 0) {
      image.hotspots.forEach((hotspot: Hotspot) => {
        if (hotspot.type === 'info') {
          const info = document.createElement('div')
          info.id = hotspot.id
          info.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-white"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
          info.className = 'absolute inset-0 flex items-center justify-center'

          info.style.width = '320px'
          info.style.height = '320px'
          info.style.backgroundColor = 'white'
          info.style.borderRadius = '8px'
          info.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
          info.style.padding = '16px'
          info.style.position = 'absolute'
          infoContainer.appendChild(info)
        }
      })
    }

    const initViewer = async () => {
      if (!containerRef.current) return

      try {
        console.log('Creating new viewer instance')

        // Log the markers being created
        const markers =
          image.hotspots?.map((hotspot) => {
            console.log(
              'Creating marker for hotspot:',
              hotspot.id,
              'type:',
              hotspot.type
            )
            return hotspot.type === 'navigation'
              ? {
                  id: hotspot.id,
                  position: {
                    yaw: hotspot.longitude,
                    pitch: hotspot.latitude,
                  },
                  html: '<div class="custom-hotspot"></div>',
                  anchor: 'center center',
                  scale: [1, 1],
                  tooltip: {
                    content: 'Click to navigate',
                    position: 'bottom',
                  },
                }
              : hotspot.type === 'image'
              ? {
                  id: hotspot.id,
                  position: {
                    yaw: hotspot.longitude,
                    pitch: hotspot.latitude,
                  },
                  imageLayer: hotspot.targetId,
                  size: { width: 320, height: 320 },
                }
              : hotspot.type === 'iframe'
              ? {
                  id: hotspot.id,
                  position: {
                    yaw: hotspot.longitude,
                    pitch: hotspot.latitude,
                  },
                  elementLayer: iframeContainer,
                }
              : hotspot.type === 'link'
              ? {
                  id: hotspot.id,
                  position: {
                    yaw: hotspot.longitude,
                    pitch: hotspot.latitude,
                  },
                  html: '<a class="custom-hotspot"></a>',
                  anchor: 'center center',
                  scale: [1, 1],
                }
              : hotspot.type === 'info'
              ? {
                  id: hotspot.id,
                  position: {
                    yaw: hotspot.longitude,
                    pitch: hotspot.latitude,
                  },
                  elementLayer: infoContainer,
                }
              : {
                  id: hotspot.id,
                  position: {
                    yaw: hotspot.longitude,
                    pitch: hotspot.latitude,
                  },
                  videoLayer: hotspot.targetId,
                  size: { width: 640, height: 640 },
                }
          }) || []

        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: image.url,
          navbar: ['autorotate', 'zoom', 'fullscreen'],
          defaultZoomLvl: 0,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: true,
          plugins: [
            [
              MarkersPlugin,
              {
                markers: markers,
              } as MarkersPluginConfig,
            ],
          ],
        })

        if (!mounted) return

        markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin)
        if (projectId) {
          markersPluginRef.current?.addEventListener(
            'select-marker',
            ({ marker }: { marker: Marker }) => {
              const hotspot = image.hotspots?.find((h) => h.id === marker.id)
              if (hotspot) {
                if (hotspot.type === 'navigation') {
                  const project = getProject(projectId)
                  const targetImage = project?.panoramas.find(
                    (img) => img.id === hotspot.targetId
                  )
                  if (targetImage && viewerRef.current) {
                    viewerRef.current.setPanorama(targetImage.url)
                    setSelectedPanorama(targetImage as ProjectImage)
                  }
                } else if (hotspot.type === 'info') {
                  setActiveHotspot(hotspot)
                } else if (hotspot.type === 'link' && hotspot.url) {
                  window.open(hotspot.url, '_blank')
                } else if (hotspot.type === 'iframe' && hotspot.url) {
                  // Show iframe in a modal or overlay
                  setActiveHotspot(hotspot)
                } else if (
                  hotspot.type === 'image' ||
                  hotspot.type === 'video'
                ) {
                  // Show image or video in a modal or overlay
                  setActiveHotspot(hotspot)
                }
              }
            }
          )
        }

        if (isAddingHotspot && onHotspotPosition) {
          const handleClick = (event: any & { type: 'click' }) => {
            if (!viewerRef.current || !markersPluginRef.current) return

            const pos =
              viewerRef.current.dataHelper?.viewerCoordsToSphericalCoords({
                x: event.data.viewerX,
                y: event.data.viewerY,
              })

            if (
              !pos ||
              typeof pos.yaw !== 'number' ||
              typeof pos.pitch !== 'number'
            )
              return

            try {
              // Safely remove existing marker if it exists
              const existingMarker = markersPluginRef.current
                .getMarkers()
                .find((m: Marker) => m.id === 'new-marker')
              if (existingMarker) {
                markersPluginRef.current.removeMarker('new-marker')
              }

              onHotspotPosition(pos.yaw, pos.pitch, hotspotType!)
            } catch (err) {
              console.error('Error handling marker operations:', err)
            }
          }

          viewerRef.current.addEventListener('click', handleClick)
        }

        console.log('Viewer setup complete with', markers.length, 'markers')
      } catch (err) {
        console.error('Error initializing viewer:', err)
        if (mounted) {
          setError(true)
        }
      }
    }

    initViewer()

    return () => {
      console.log('Cleaning up viewer')
      mounted = false
      if (markersPluginRef.current) {
        try {
          // Safely clear markers on unmount
          const markers = markersPluginRef.current.getMarkers()
          markers.forEach((marker: Marker) => {
            try {
              markersPluginRef.current.removeMarker(marker.id)
            } catch (err) {
              console.error(`Error removing marker ${marker.id}:`, err)
            }
          })
        } catch (err) {
          console.error('Error clearing markers:', err)
        }
      }
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [
    image.id,
    image.url,
    // Important: stringify the hotspots to detect changes
    JSON.stringify(image.hotspots),
    isAddingHotspot,
    hotspotType,
    projectId,
    onHotspotPosition,
    setSelectedPanorama,
    getProject,
  ])

  if (error) {
    return (
      <div className='h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-lg'>
        <div className='text-center text-gray-500'>
          <AlertCircle className='mx-auto h-8 w-8 mb-2' />
          <p>Failed to load 360° image</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className='h-[400px] w-full rounded-lg overflow-hidden'
        style={{ cursor: isAddingHotspot ? 'crosshair' : 'grab' }}
      />

      {/* Info Hotspot Modal */}
      {activeHotspot && activeHotspot.type === 'info' && (
        <InfoHotspotModal
          hotspot={activeHotspot}
          onClose={() => setActiveHotspot(null)}
        />
      )}
    </>
  )
}

export default PanoramaViewer