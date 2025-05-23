import { useState, useCallback } from 'react';
import { exportProject } from '../lib/export-utils';
import { Project } from '../types';

export const useProjectExport = (project: Project | undefined) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!project) return;

    try {
      setIsExporting(true);
      await exportProject(project);
    } catch (error) {
      console.error('Fehler beim Exportieren:', error);
      alert('Beim Exportieren ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsExporting(false);
    }
  }, [project]);

  return {
    isExporting,
    handleExport
  };
};