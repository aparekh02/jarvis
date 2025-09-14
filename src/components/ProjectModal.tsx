import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Palette } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PROJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export function ProjectModal({ open, onOpenChange, onSuccess }: ProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        tasks: []
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-7c72c08c/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        toast.success('Project created successfully')
        onSuccess()
        onOpenChange(false)
        // Reset form
        setName('')
        setDescription('')
        setSelectedColor(PROJECT_COLORS[0])
      } else {
        throw new Error('Failed to create project')
      }
    } catch (error) {
      console.log('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-light text-slate-800">
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="border-blue-200 focus:border-blue-400"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add project description..."
              className="border-blue-200 focus:border-blue-400 min-h-[80px]"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-blue-500" />
              <Label>Project Color</Label>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    selectedColor === color 
                      ? 'border-slate-400 ring-2 ring-blue-200' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {name && (
            <div className="p-4 bg-slate-50 rounded-lg border border-l-4" style={{ borderLeftColor: selectedColor }}>
              <h3 className="font-medium text-slate-800">{name}</h3>
              {description && (
                <p className="text-sm text-slate-600 mt-1">{description}</p>
              )}
              <div className="text-xs text-slate-400 mt-2">Preview</div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}