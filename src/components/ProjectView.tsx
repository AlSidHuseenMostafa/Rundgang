'use client'

import type React from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { ArrowLeft, Download } from 'lucide-react'
import type { ProjectImage } from '../types'
import { useHotspotManager } from '../hooks/useHotspotManager'
import { useUploadManager } from '../hooks/useUploadManager'
import { useProjectExport } from '../hooks/useProjectExport'
import PanoramaList from './panorama-list'
import PanoramaViewer from './panorama-viewer'
import UploadDialog from './upload-dialog'
import HotspotControls from './hotspot-controls'
import MediaSelectorDialog from './media-selector-dialog'
import InfoHotspotForm from './info-hotspot-form'
import UrlHotspotForm from './url-hotspot-form'
import IframeHotspotForm from './iframe-hotspot-form'
import { useState, useCallback, useEffect } from 'react'

const ProjectView: React.FC = () => {
  console.log('Rendering ProjectView')

  const { projectId } = useParams<{ projectId: string }>()
  const { getProject } = useProjectStore()
  const [selectedPanoramaId, setSelectedPanoramaId] = useState<string | null>(
    null
  )
  const [viewerKey, setViewerKey] = useState(0)

  // Force re-render on component mount and when viewerKey changes
  useEffect(() => {
    console.log('ViewerKey changed:', viewerKey)
  }, [viewerKey])

  // Get the project and selected panorama
  const project = getProject(projectId!)

  // Get the selected panorama directly from the project each time
  // This ensures we always have the latest version with updated hotspots
  const selectedPanorama = selectedPanoramaId
    ? project?.panoramas.find((p) => p.id === selectedPanoramaId) || null
    : null

  const setSelectedPanorama = useCallback((panorama: ProjectImage) => {
    setSelectedPanoramaId(panorama.id)
  }, [])

  const hotspotManager = useHotspotManager(projectId!, selectedPanorama, () => {
    // Force re-render after hotspot addition
    console.log('Hotspot added, incrementing viewerKey')
    setViewerKey((prev) => prev + 1)
  })

  const uploadManager = useUploadManager(projectId!)
  const projectExport = useProjectExport(project)

  const handleBack = useCallback(() => {
    window.history.back()
  }, [])

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex justify-between items-center p-4 border-b'>
        <button
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
          onClick={handleBack}
        >
          <ArrowLeft size={20} /> Zurück
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>{project.name}</h1>
        <div className='flex gap-2'>
          <button
            className='flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50'
            onClick={projectExport.handleExport}
            disabled={projectExport.isExporting}
          >
            <Download size={20} />
            {projectExport.isExporting ? 'Exportiere...' : 'Exportieren'}
          </button>

          <HotspotControls
            selectedPanorama={selectedPanorama}
            hotspotManager={hotspotManager}
            uploadManager={uploadManager}
          />
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden flex-row-reverse'>
        {/* Main Panorama View */}
        <div className='flex-1 p-4'>
          {selectedPanorama ? (
            <PanoramaViewer
              key={`${selectedPanorama.id}-${viewerKey}`}
              image={selectedPanorama}
              isAddingHotspot={
                (hotspotManager.isAddingHotspot &&
                  hotspotManager.hotspotType === 'navigation' &&
                  hotspotManager.targetPanorama !== null) ||
                (hotspotManager.isAddingHotspot &&
                  (hotspotManager.hotspotType === 'image' ||
                    hotspotManager.hotspotType === 'video') &&
                  hotspotManager.selectedMedia !== null) ||
                (hotspotManager.isAddingHotspot &&
                  hotspotManager.hotspotType === 'info' &&
                  hotspotManager.infoTitle !== '' &&
                  hotspotManager.infoText !== '') ||
                (hotspotManager.isAddingHotspot &&
                  hotspotManager.hotspotType === 'link' &&
                  hotspotManager.urlLink !== '') ||
                (hotspotManager.isAddingHotspot &&
                  hotspotManager.hotspotType === 'iframe' &&
                  hotspotManager.iframeLink !== '')
              }
              hotspotType={hotspotManager.hotspotType}
              projectId={projectId}
              onHotspotPosition={hotspotManager.handleHotspotPosition}
              setSelectedPanorama={setSelectedPanorama}
              
            />
          ) : (
            <div className='h-full flex items-center justify-center bg-gray-50 rounded-lg'>
              <p className='text-gray-500'>Wähle ein Panorama aus der Liste</p>
            </div>
          )}
        </div>

        {/* Panorama List */}
        <PanoramaList
          project={project}
          selectedPanorama={selectedPanorama}
          setSelectedPanorama={setSelectedPanorama}
          isAddingHotspot={hotspotManager.isAddingHotspot}
          hotspotType={hotspotManager.hotspotType}
          targetPanorama={hotspotManager.targetPanorama}
          setTargetPanorama={hotspotManager.setTargetPanorama}
        />
      </div>

      {/* Dialogs - These are conditionally rendered based on state */}
      {uploadManager.showUpload && (
        <UploadDialog uploadManager={uploadManager} />
      )}

      {hotspotManager.showMediaSelector && (
        <MediaSelectorDialog
          project={project}
          hotspotManager={hotspotManager}
        />
      )}

      {hotspotManager.showInfoForm && (
        <InfoHotspotForm hotspotManager={hotspotManager} />
      )}

      {hotspotManager.showUrlForm && (
        <UrlHotspotForm hotspotManager={hotspotManager} />
      )}

      {hotspotManager.showIframeForm && (
        <IframeHotspotForm hotspotManager={hotspotManager} />
      )}
    </div>
  )
}

export default ProjectView