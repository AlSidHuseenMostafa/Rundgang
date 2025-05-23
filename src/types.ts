export interface Project {
  id: string
  name: string
  panoramas: ProjectImage[]
  images: RegularImage[]
  videos: Video[]
}

export interface ProjectImage { 
  id: string
  url: string
  hotspots: Hotspot[]
}

export interface RegularImage {
  id: string
  url: string
}

export interface Video {
  id: string
  url: string
}

export interface Hotspot {
  id: string
  targetId: string
  longitude: number
  latitude: number
  type: "link" | "image" | "video" | "info" | "navigation" | "iframe"
  title?: string
  text?: string
  url?: string
}

// Type definition for Photo Sphere Viewer markers
export interface PSVMarker {
  id: string
  position: {
    yaw: number
    pitch: number
  }
  html?: string
  anchor?: string
  scale?: number[]
  tooltip?: {
    content: string
    position: string
  }
  data?: any
}
