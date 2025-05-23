import type React from "react"
import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { Button } from "../components/ui/button"
import { importProject } from "../lib/import-utils"
import IndexedDBStatus from "./IndexedDBStatus"
import { Trash2, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Input } from "./ui/input";



const ProjectList: React.FC = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { projects, addProject, deleteProject,editProjectName } = useProjectStore();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = () => {
    if (projectName.trim()) {
      const newProject = addProject(projectName.trim());
      setProjectName('');
      setShowNewProject(false);
      navigate(`/project/${newProject.id}`);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".zip"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await handleImport(file)
      }
    }
    input.click()
  }

  const handleImport = async (file: File) => {
    try {
      setIsImporting(true)
      const newProject = await importProject(file)
      if (newProject) {
        setTimeout(() => {
          navigate(`/project/${newProject.id}`)
        }, 100)

      }
    } catch (error) {
      console.error("Fehler beim Importieren:", error)
      alert("Beim Importieren ist ein Fehler aufgetreten. Bitte versuche es erneut.")
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId)
  }
  
  return (
    <div className="p-6">
      <IndexedDBStatus />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">360° Projekte</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <Upload size={20} />
            {isImporting ? "Importiere..." : "Importieren"}
          </Button>
          <Button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={20} />
            Neues Projekt
          </Button>
        </div>
      </div>

      {showNewProject && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Neues Projekt erstellen</h2>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Projektname"
            className="w-full p-2 border rounded-md mb-4"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700">
              Erstellen
            </Button>
            <Button variant="outline" onClick={() => setShowNewProject(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex  items-center mb-4 justify-between">

              <h2 className="text-xl font-semibold mb-2" onClick={() => navigate(`/project/${project.id}`)}
              >{project.name}</h2>
              <div className="flex gap-2">

                <Dialog>
                  <DialogTrigger><Button className="bg-blue-600 hover:bg-blue-700">
                    <Pencil size={20} />
                  </Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>

                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      
                    </DialogHeader>
                    <Input type="text" placeholder={project.name} onChange={(e)=> setNewProjectName(e.target.value)}/>
             
                    <DialogClose>       <Button onClick={()=>editProjectName(project.id,newProjectName)}>save</Button></DialogClose>
                    <DialogClose>Close</DialogClose>
                  </DialogContent>
                </Dialog>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteProject(project.id)}>
                  <Trash2 size={20} />
                </Button>

              </div>

            </div>
            <p className="text-gray-500">{project.panoramas.length} Panoramen</p>
            <p className="text-gray-500">{project.images.length} Bilder</p>
            <p className="text-gray-500">{project.videos.length} Videos</p>
          </div>
        ))}
      </div>

      {projects.length === 0 && !showNewProject && (
        <div className="text-center py-12">
          <p className="text-gray-500">Noch keine Projekte vorhanden. Klicke auf "Neues Projekt", um zu beginnen.</p>
        </div>
      )}
    </div>
  );
}

export default ProjectList;