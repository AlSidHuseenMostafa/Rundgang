import { useState, useCallback } from 'react';
import { useProjectStore } from '../store/projectStore';

type UploadType = 'panorama' | 'image' | 'video';

export const useUploadManager = (projectId: string) => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>('panorama');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { addPanoramaToProject, addImageToProject, addVideoToProject } = useProjectStore();

  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          if (uploadType === 'panorama') {
            addPanoramaToProject(projectId, e.target.result as string);
            setShowUpload(false);
          } else if (uploadType === 'image') {
            addImageToProject(projectId, e.target.result as string);
            setShowUpload(false);
          } else if (uploadType === 'video') {
            addVideoToProject(projectId, e.target.result as string);
            setShowUpload(false);
          }
        } catch (err) {
          console.error('Fehler beim Verarbeiten der Datei:', err);
          setUploadError('Datei konnte nicht verarbeitet werden. Bitte versuche eine andere Datei.');
        }
      } else {
        setUploadError('Datei konnte nicht gelesen werden.');
      }
    };
    
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  }, [projectId, uploadType, addPanoramaToProject, addImageToProject, addVideoToProject]);

  const startUpload = useCallback((type: UploadType) => {
    setShowUpload(true);
    setUploadType(type);
  }, []);

  return {
    showUpload,
    setShowUpload,
    uploadType,
    uploadError,
    handleFileSelect,
    startUpload
  };
};
