'use client'

import { create } from 'zustand'
import type {
  Project,
  ProjectImage,
  Hotspot,
  RegularImage,
  Video,
} from '../types'
import { indexedDBStorage } from '../lib/indexed-db-storage'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ProjectState {
  projects: Project[]
  addProject: (name: string) => Project
  deleteProject: (name: string) => string
  editProjectName: (projectId: string, newName: string) => void
  addPanoramaToProject: (projectId: string, imageUrl: string) => void
  addImageToProject: (projectId: string, imageUrl: string) => void
  addVideoToProject: (projectId: string, videoUrl: string) => void
  addHotspot: (
    projectId: string,
    imageId: string,
    hotspot: Omit<Hotspot, 'id'>
  ) => void

  addImageHotspot: (
    projectId: string,
    panoramaId: string,
    imageId: RegularImage,
    longitude: number,
    latitude: number,
    type: 'link' | 'image' | 'video'
  ) => void
  addVideoHotspot: (
    projectId: string,
    panoramaId: string,
    video: Video,
    longitude: number,
    latitude: number,
    type: 'link' | 'image' | 'video'
  ) => void
  addInfoHotspot: (
    projectId: string,
    panoramaId: string,
    title: string,
    text: string,
    longitude: number,
    latitude: number
  ) => void
  addUrlHotspot: (
    projectId: string,
    panoramaId: string,
    url: string,
    longitude: number,
    latitude: number
  ) => void
  addIframeHotspot: (
    projectId: string,
    panoramaId: string,
    url: string,
    longitude: number,
    latitude: number
  ) => void
  getProject: (projectId: string) => Project | undefined
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (name: string) => {
        const newProject: Project = {
          id: Math.random().toString(36).substring(2),
          name,
          panoramas: [],
          images: [],
          videos: [],
        }

        set((state) => ({
          projects: [...state.projects, newProject],
        }))

        return newProject
      },
      deleteProject: (projectId: string) => {
        set((state) => ({
          projects: state.projects.filter(
            (project) => project.id !== projectId
          ),
        }))

        return projectId
      },
      editProjectName: (projectId: string, newName: string) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                name: newName,
              }
            }
            return project
          }),
        }))
      },
      addPanoramaToProject: (projectId: string, imageUrl: string) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              const newImage: ProjectImage = {
                id: Math.random().toString(36).substring(2),
                url: imageUrl,
                hotspots: [],
              }
              return {
                ...project,
                panoramas: [...project.panoramas, newImage],
              }
            }

            return project
          }),
        }))
      },

      addImageToProject: (projectId: string, imageUrl: string) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              const newImage: RegularImage = {
                id: Math.random().toString(36).substring(2),
                url: imageUrl,
              }
              return {
                ...project,
                images: [...project.images, newImage],
              }
            }
            return project
          }),
        }))
      },

      addVideoToProject: (projectId: string, videoUrl: string) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id === projectId) {
              const newVideo: Video = {
                id: Math.random().toString(36).substring(2),
                url: videoUrl,
              }
              return {
                ...project,
                videos: [...project.videos, newVideo],
              }
            }
            return project
          }),
        }))
      },

      addHotspot: (projectId: string, imageId: string, hotspotData) => {
        const newHotspot: Hotspot = {
          ...hotspotData,
          id: Math.random().toString(36).substring(2),
        }

        set((state) => {
          // Create a deep copy of the projects array to ensure state immutability
          const updatedProjects = state.projects.map((project) => {
            if (project.id === projectId) {
              // Create a deep copy of the project
              return {
                ...project,
                panoramas: project.panoramas.map((panorama) => {
                  if (panorama.id === imageId) {
                    // Create a deep copy of the panorama with the new hotspot
                    return {
                      ...panorama,
                      hotspots: [...(panorama.hotspots || []), newHotspot],
                    }
                  }
                  return panorama
                }),
              }
            }
            return project
          })

          // Return a completely new state object
          return {
            projects: updatedProjects,
          }
        })

        // Force a re-render by triggering another state update
        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      addImageHotspot: (
        projectId: string,
        panoramaId: string,
        imageId: RegularImage,
        longitude: number,
        latitude: number,
        type: 'link' | 'image' | 'video'
      ) => {
        const newHotspot: Hotspot = {
          id: Math.random().toString(36).substring(2),
          targetId: imageId.url,
          longitude,
          latitude,
          type: type,
        }

        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                panoramas: project.panoramas.map((panorama) => {
                  if (panorama.id === panoramaId) {
                    return {
                      ...panorama,
                      hotspots: [...(panorama.hotspots || []), newHotspot],
                    }
                  }
                  return panorama
                }),
              }
            }
            return project
          })

          return {
            projects: updatedProjects,
          }
        })

        // Force a re-render by triggering another state update
        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      addVideoHotspot: (
        projectId: string,
        panoramaId: string,
        video: Video,
        longitude: number,
        latitude: number,
        type: 'link' | 'image' | 'video'
      ) => {
        const newHotspot: Hotspot = {
          id: Math.random().toString(36).substring(2),
          targetId: video.url,
          longitude,
          latitude,
          type,
        }

        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                panoramas: project.panoramas.map((panorama) => {
                  if (panorama.id === panoramaId) {
                    return {
                      ...panorama,
                      hotspots: [...(panorama.hotspots || []), newHotspot],
                    }
                  }
                  return panorama
                }),
              }
            }
            return project
          })

          return {
            projects: updatedProjects,
          }
        })

        // Force a re-render by triggering another state update
        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      addInfoHotspot: (
        projectId: string,
        panoramaId: string,
        title: string,
        text: string,
        longitude: number,
        latitude: number
      ) => {
        const newHotspot: Hotspot = {
          id: Math.random().toString(36).substring(2),
          targetId: '', // Kein Target für Info-Hotspots
          longitude,
          latitude,
          type: 'info',
          title,
          text,
        }

        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                panoramas: project.panoramas.map((panorama) => {
                  if (panorama.id === panoramaId) {
                    return {
                      ...panorama,
                      hotspots: [...(panorama.hotspots || []), newHotspot],
                    }
                  }
                  return panorama
                }),
              }
            }
            return project
          })

          return {
            projects: updatedProjects,
          }
        })

        // Force a re-render by triggering another state update
        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      addUrlHotspot: (
        projectId: string,
        panoramaId: string,
        url: string,
        longitude: number,
        latitude: number
      ) => {
        const newHotspot: Hotspot = {
          id: Math.random().toString(36).substring(2),
          targetId: '', // Kein Target für URL-Hotspots
          longitude,
          latitude,
          type: 'link',
          url,
        }

        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                panoramas: project.panoramas.map((panorama) => {
                  if (panorama.id === panoramaId) {
                    return {
                      ...panorama,
                      hotspots: [...(panorama.hotspots || []), newHotspot],
                    }
                  }
                  return panorama
                }),
              }
            }
            return project
          })

          return {
            projects: updatedProjects,
          }
        })

        // Force a re-render by triggering another state update
        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      addIframeHotspot: (
        projectId: string,
        panoramaId: string,
        url: string,
        longitude: number,
        latitude: number
      ) => {
        const newHotspot: Hotspot = {
          id: Math.random().toString(36).substring(2),
          targetId: '', // Kein Target für Iframe-Hotspots
          longitude,
          latitude,
          type: 'iframe',
          url,
        }

        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                panoramas: project.panoramas.map((panorama) => {
                  if (panorama.id === panoramaId) {
                    return {
                      ...panorama,
                      hotspots: [...(panorama.hotspots || []), newHotspot],
                    }
                  }
                  return panorama
                }),
              }
            }
            return project
          })

          return {
            projects: updatedProjects,
          }
        })

        // Force a re-render by triggering another state update
        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      getProject: (projectId: string) => {
        return get().projects.find((p) => p.id === projectId)
      },
    }),
    {
      name: 'virtual-tour-storage',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
)