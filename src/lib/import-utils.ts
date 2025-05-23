import JSZip from 'jszip'
import type { Project, RegularImage, Video } from '../types'
import { useProjectStore } from '../store/projectStore'

// Funktion zum Konvertieren eines Blobs zu Base64
const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Funktion zum Importieren eines Projekts aus einer ZIP-Datei
export const importProject = async (file: File): Promise<Project | null> => {
  try {
    const zip = await JSZip.loadAsync(file)

    // Extrahiere Projektdaten aus der tour-data.js Datei
    const tourDataFile = zip.file('js/tour-data.js')
    if (!tourDataFile) {
      throw new Error('Keine Projektdaten gefunden')
    }

    const tourDataContent = await tourDataFile.async('text')
    // Extrahiere das JSON aus der JavaScript-Datei
    const jsonMatch = tourDataContent.match(/const tourData = (.*);/s)
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error('Ungültiges Projektdatenformat')
    }

    const projectData = JSON.parse(jsonMatch[1])

    // Erstelle ein neues Projekt
    const { addProject } = useProjectStore.getState()
    const newProject = addProject(projectData.name)
    console.log('Projekt erfolgreich erstellt:', newProject.name, newProject.id)

    // Importiere Panoramen
    for (const panorama of projectData.panoramas) {
      const panoramaFile =
        zip.file(`panoramas/${panorama.id}.jpg`) ||
        zip.file(`panoramas/${panorama.id}.png`) ||
        zip.file(`panoramas/${panorama.id}.gif`)

      if (panoramaFile) {
        const blob = await panoramaFile.async('blob')
        const base64 = await blobToBase64(blob)

        // Füge das Panorama zum Projekt hinzu
        const { addPanoramaToProject } = useProjectStore.getState()
        addPanoramaToProject(newProject.id, base64)
      }
    }

    // Importiere Bilder
    for (const image of projectData.images) {
      const imageFile =
        zip.file(`images/${image.id}.jpg`) ||
        zip.file(`images/${image.id}.png`) ||
        zip.file(`images/${image.id}.gif`)

      if (imageFile) {
        const blob = await imageFile.async('blob')
        const base64 = await blobToBase64(blob)

        // Füge das Bild zum Projekt hinzu
        const { addImageToProject } = useProjectStore.getState()
        addImageToProject(newProject.id, base64)
      }
    }

    // Importiere Videos
    for (const video of projectData.videos) {
      const videoFile =
        zip.file(`videos/${video.id}.mp4`) ||
        zip.file(`videos/${video.id}.webm`)

      if (videoFile) {
        const blob = await videoFile.async('blob')
        const base64 = await blobToBase64(blob)
        const splitUrl = base64.replace(
          'data:application/octet-stream;',
          'data:video/mp4;'
        )
        // Füge das Video zum Projekt hinzu
        const { addVideoToProject } = useProjectStore.getState()
        addVideoToProject(newProject.id, splitUrl)
      }
    }

    // Importiere Hotspots
    // Da die Hotspots bereits in den Panorama-Objekten enthalten sind,
    // müssen wir sie nur für die neu erstellten Panoramen hinzufügen
    const {
      getProject,
      addHotspot,
      addImageHotspot,
      addVideoHotspot,
      addInfoHotspot,
      addUrlHotspot,
      addIframeHotspot,
    } = useProjectStore.getState()
    const importedProject = getProject(newProject.id)

    if (importedProject && importedProject.panoramas.length > 0) {
      for (
        let i = 0;
        i <
        Math.min(
          projectData.panoramas.length,
          importedProject.panoramas.length
        );
        i++
      ) {
        const originalPanorama = projectData.panoramas[i]
        const newPanorama = importedProject.panoramas[i]

        for (const hotspot of originalPanorama.hotspots) {
          switch (hotspot.type) {
            case 'navigation':
              // Find the target panorama in the imported panoramas
              const targetIndex = projectData.panoramas.findIndex(
                (p: { id: string; url: string }) => p.id === hotspot.targetId
              )
              if (
                targetIndex >= 0 &&
                targetIndex < importedProject.panoramas.length
              ) {
                addHotspot(newProject.id, newPanorama.id, {
                  targetId: importedProject.panoramas[targetIndex].id,
                  longitude: hotspot.longitude,
                  latitude: hotspot.latitude,
                  type: 'navigation',
                })
              }
              break

            case 'image':
              // Find the target image in the imported images
              const imageIndex = projectData.images.findIndex(
                (img: { id: string; url: string }) =>
                  img.url === hotspot.targetId
              )
              if (
                imageIndex >= 0 &&
                imageIndex < importedProject.images.length
              ) {
                addImageHotspot(
                  newProject.id,
                  newPanorama.id,
                  importedProject.images[imageIndex] as RegularImage,
                  hotspot.longitude,
                  hotspot.latitude,
                  'image'
                )
              }
              break

            case 'video':
              // Find the target video in the imported videos
              const videoIndex = projectData.videos.findIndex(
                (vid: { id: string; url: string }) =>
                  vid.url === hotspot.targetId
              )
              if (
                videoIndex >= 0 &&
                videoIndex < importedProject.videos.length
              ) {
                addVideoHotspot(
                  newProject.id,
                  newPanorama.id,
                  importedProject.videos[videoIndex] as Video,
                  hotspot.longitude,
                  hotspot.latitude,
                  'video'
                )
              }
              break
            case 'info':
              // Add info hotspot
              if (hotspot.title && hotspot.text) {
                addInfoHotspot(
                  newProject.id,
                  newPanorama.id,
                  hotspot.title,
                  hotspot.text,
                  hotspot.longitude,
                  hotspot.latitude
                )
              }
              break
            case 'iframe':
              // Add iframe hotspot
              if (hotspot.url) {
                addIframeHotspot(
                  newProject.id,
                  newPanorama.id,
                  hotspot.url,
                  hotspot.longitude,
                  hotspot.latitude
                )
              }
              break
            case 'link':
              if (hotspot.url) {
                addUrlHotspot(
                  newProject.id,
                  newPanorama.id,
                  hotspot.url,
                  hotspot.longitude,
                  hotspot.latitude
                )
              }
              break
            default:
              console.warn(`Unbekannter Hotspot-Typ: ${hotspot.type}`)
          }
        }
      }
    }

    console.log('Projekt erfolgreich importiert!')
    return newProject
  } catch (error) {
    console.error('Fehler beim Importieren des Projekts:', error)
    throw error
  }
}
