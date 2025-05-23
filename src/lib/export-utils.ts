import JSZip from "jszip"
import { saveAs } from "file-saver"
import type { Project } from "../types"

// Funktion zum Abrufen externer Skripte
const fetchScript = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error(`Fehler beim Abrufen des Scripts ${url}:`, error);
    throw error;
  }
};
// Funktion zum Extrahieren der Datei-Erweiterung aus einer Base64-URL
const getExtensionFromBase64 = (base64: string): string => {
  if (base64.startsWith("data:image/jpeg")) return "jpg"
  if (base64.startsWith("data:image/png")) return "png"
  if (base64.startsWith("data:image/gif")) return "gif"
  if (base64.startsWith("data:video/mp4")) return "mp4"
  if (base64.startsWith("data:video/webm")) return "webm"
  return "jpg" // Standardwert
}

// Funktion zum Konvertieren von Base64 zu Blob
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(";base64,")
  const contentType = parts[0].split(":")[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
}

// Generiere HTML-Template für die exportierte Tour
const generateHtml = (project: Project): string => {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - 360° Tour</title>
  <link rel="stylesheet" href="./css/styles.css">
  <link rel="stylesheet" href="./css/photo-sphere-viewer.min.css">
  <link rel="stylesheet" href="./css/markers-plugin.min.css">
</head>
<body>
  <header>
    <h1>${project.name}</h1>
  </header>
  
  <main>
    <div id="viewer-container"></div>
    
    <div class="panorama-list">
      <h2>Panoramen</h2>
      <div class="thumbnails">
        ${project.panoramas
          .map(
            (panorama, index) => `
          <div class="thumbnail" data-panorama-id="${panorama.id}">
            <img src="./panoramas/${panorama.id}.${getExtensionFromBase64(panorama.url)}" alt="Panorama ${index + 1}">
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </main>

  <script src="./lib/three.min.js"></script>
  <script src="./lib/photo-sphere-viewer.min.js"></script>
  <script src="./lib/markers-plugin.min.js"></script>
  <script src="./js/tour-data.js"></script>
  <script src="./js/main.js"></script>
</body>
</html>`
}

// Generiere CSS für die exportierte Tour
const generateCss = (): string => {
  return `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

header {
  background-color: #2563eb;
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

#viewer-container {
  height: 70vh;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.panorama-list {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panorama-list h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.thumbnail {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
}

.thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail.active {
  border: 3px solid #2563eb;
}

.custom-hotspot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.custom-hotspot:hover {
  transform: scale(1.2);
}

.navigation-hotspot {
  background-color: rgba(0, 123, 255, 0.7);
  border: 2px solid white;
}

.image-hotspot {
  background-color: rgba(76, 175, 80, 0.7);
  border: 2px solid white;
}

.video-hotspot {
  background-color: rgba(244, 67, 54, 0.7);
  border: 2px solid white;
}

@media (min-width: 768px) {
  main {
    flex-direction: row;
  }
  
  #viewer-container {
    flex: 1;
    height: 80vh;
    margin-right: 1rem;
    margin-bottom: 0;
  }
  
  .panorama-list {
    width: 250px;
  }
  
  .thumbnails {
    grid-template-columns: 1fr;
  }
}`
}

// Generiere JavaScript für die exportierte Tour
const generateTourData = (project: Project): string => {
  return `const tourData = ${JSON.stringify(project, null, 2)};`
}

// Generiere JavaScript für die exportierte Tour
const generateMainJs = (): string => {
  return `// Initialisiere den Viewer
  import { Viewer } from '@photo-sphere-viewer/core';
let viewer;
let currentPanoramaId;

// Funktion zum Initialisieren des Viewers
function initViewer(panoramaId) {
  const panorama = tourData.panoramas.find(p => p.id === panoramaId);
  if (!panorama) return;
  
  currentPanoramaId = panoramaId;
  
  // Wenn ein vorheriger Viewer existiert, zerstöre ihn
  if (viewer) {
    viewer.destroy();
  }
  
  // Erstelle einen neuen Viewer
  viewer = new Viewer({
    container: document.getElementById('viewer-container'),
    panorama: \`./panoramas/\${panorama.id}.\${getExtensionFromUrl(panorama.url)}\`,
    navbar: ['autorotate', 'zoom', 'fullscreen'],
    defaultZoomLvl: 0,
    touchmoveTwoFingers: true,
    mousewheelCtrlKey: true,
    plugins: [
      [PhotoSphereViewer.MarkersPlugin, {
        markers: createMarkers(panorama)
      }]
    ]
  });
  
  // Markiere das aktive Thumbnail
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
    if (thumb.dataset.panoramaId === panoramaId) {
      thumb.classList.add('active');
    }
  });
  
  // Füge Event-Listener für Marker hinzu
  const markersPlugin = viewer.getPlugin(PhotoSphereViewer.MarkersPlugin);
  markersPlugin.addEventListener('select-marker', (event) => {
    const marker = event.marker;
    const hotspot = panorama.hotspots.find(h => h.id === marker.id);
    
    if (hotspot) {
      if (hotspot.type === 'navigation') {
        // Navigiere zu einem anderen Panorama
        initViewer(hotspot.targetId);
      } else if (hotspot.type === 'image') {
        // Zeige ein Bild an
        const image = tourData.images.find(img => img.id === hotspot.targetId);
        if (image) {
          showImageModal(\`./images/\${image.id}.\${getExtensionFromUrl(image.url)}\`);
        }
      } else if (hotspot.type === 'video') {
        // Spiele ein Video ab
        const video = tourData.videos.find(vid => vid.id === hotspot.targetId);
        if (video) {
          showVideoModal(\`./videos/\${video.id}.\${getExtensionFromUrl(video.url)}\`);
        }
      }
    }
  });
}

// Funktion zum Erstellen von Markern aus Hotspots
function createMarkers(panorama) {
  return panorama.hotspots.map(hotspot => ({
    id: hotspot.id,
    position: {
      yaw: hotspot.longitude,
      pitch: hotspot.latitude
    },
    html: \`<div class="custom-hotspot \${hotspot.type}-hotspot"></div>\`,
    anchor: 'center center',
    scale: [1, 1],
    tooltip: {
      content: hotspot.type === 'link' ? 'Zum Panorama' : 
               hotspot.type === 'image' ? 'Bild anzeigen' : 
               'Video abspielen',
      position: 'bottom'
    }
  }));
}

// Funktion zum Anzeigen eines Bild-Modals
function showImageModal(imageUrl) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = \`
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <img src="\${imageUrl}" alt="Bild">
    </div>
  \`;
  document.body.appendChild(modal);
  
  modal.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Funktion zum Anzeigen eines Video-Modals
function showVideoModal(videoUrl) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = \`
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <video src="\${videoUrl}" controls autoplay></video>
    </div>
  \`;
  document.body.appendChild(modal);
  
  modal.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Hilfsfunktion zum Extrahieren der Dateierweiterung aus einer URL
function getExtensionFromUrl(url) {
  if (url.includes('data:image/jpeg')) return 'jpg';
  if (url.includes('data:image/png')) return 'png';
  if (url.includes('data:image/gif')) return 'gif';
  if (url.includes('data:video/mp4')) return 'mp4';
  if (url.includes('data:video/webm')) return 'webm';
  return 'jpg'; // Standardwert
}

// Event-Listener für Thumbnail-Klicks
document.querySelectorAll('.thumbnail').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const panoramaId = thumb.dataset.panoramaId;
    initViewer(panoramaId);
  });
});

// Starte mit dem ersten Panorama
if (tourData.panoramas.length > 0) {
  initViewer(tourData.panoramas[0].id);
}

// Füge CSS für Modals hinzu
const style = document.createElement('style');
style.textContent = \`
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1001;
  }
  
  .modal-content img,
  .modal-content video {
    display: block;
    max-width: 100%;
    max-height: 80vh;
  }
\`;
document.head.appendChild(style);`
}

// Hauptfunktion zum Exportieren eines Projekts
export const exportProject = async (project: Project): Promise<void> => {
  try {
    const zip = new JSZip()

    // Erstelle Verzeichnisstruktur
    const panoramasFolder = zip.folder("panoramas")
    const imagesFolder = zip.folder("images")
    const videosFolder = zip.folder("videos")
    const cssFolder = zip.folder("css")
    const jsFolder = zip.folder("js")
    const libFolder = zip.folder("lib")

    // Füge Panoramen hinzu
    for (const panorama of project.panoramas) {
      const extension = getExtensionFromBase64(panorama.url)
      const blob = base64ToBlob(panorama.url)
      panoramasFolder?.file(`${panorama.id}.${extension}`, blob)
    }

    // Füge Bilder hinzu
    for (const image of project.images) {
      const extension = getExtensionFromBase64(image.url)
      const blob = base64ToBlob(image.url)
      imagesFolder?.file(`${image.id}.${extension}`, blob)
    }

    // Füge Videos hinzu
    for (const video of project.videos) {
      const extension = getExtensionFromBase64(video.url)
      const blob = base64ToBlob(video.url)
      videosFolder?.file(`${video.id}.${extension}`, blob)
    }

    // Füge HTML, CSS und JavaScript hinzu
    zip.file("index.html", generateHtml(project))
    cssFolder?.file("styles.css", generateCss())
    jsFolder?.file("tour-data.js", generateTourData(project))
    jsFolder?.file("main.js", generateMainJs())

    // Füge Photo Sphere Viewer Bibliothek hinzu
    // Füge three.min.js hinzu
    const threeJs = await fetchScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
    
    libFolder?.file("three.min.js", threeJs)

    // Füge photo-sphere-viewer.min.js hinzu
    const photoSphereViewer = await fetchScript("https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.13.2/index.module.min.js");
    libFolder?.file("photo-sphere-viewer.min.js", photoSphereViewer)
    
    
    // Füge photo-sphere-viewer.min.css hinzu
    const photoSphereViewerCss = await fetchScript("https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.13.2/index.min.css");
    
    cssFolder?.file("photo-sphere-viewer.min.css", photoSphereViewerCss);
    
    // Füge markers-plugin.min.js hinzu
    const markersPlugin = await fetchScript("https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5.13.2/index.module.min.js");
    libFolder?.file("markers-plugin.min.js", markersPlugin);
    
    // Füge markers-plugin.min.css hinzu
    const markersPluginCss = await fetchScript("https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5.13.2/index.min.css");
    cssFolder?.file("markers-plugin.min.css", markersPluginCss);
    
   
    
    // Generiere und speichere die ZIP-Datei
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `${project.name.replace(/\s+/g, "-").toLowerCase()}-tour.zip`)

    console.log("Projekt erfolgreich exportiert!")
  } catch (error) {
    console.error("Fehler beim Exportieren des Projekts:", error)
    throw error
  }
}