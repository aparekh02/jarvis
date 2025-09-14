import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Plus, Calendar, Clock, Flag } from 'lucide-react';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  estimatedTime: number;
}

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  projects: string[];
}

export function TaskForm({ onSubmit, projects }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    deadline: '',
    estimatedTime: 60
  });

  const [newProject, setNewProject] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) return;

    const projectName = showNewProject ? newProject : formData.project;
    
    onSubmit({
      ...formData,
      project: projectName
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      project: '',
      priority: 'medium',
      deadline: '',
      estimatedTime: 60
    });
    setNewProject('');
    setShowNewProject(false);
  };

  const handleProjectChange = (value: string) => {
    if (value === 'new-project') {
      setShowNewProject(true);
      setFormData({ ...formData, project: '' });
    } else {
      setShowNewProject(false);
      setFormData({ ...formData, project: value });
    }
  };

  // Generate default deadline (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDeadline = tomorrow.toISOString().split('T')[0];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-blue-600" />
          <span>Add New Task</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Complete math homework chapter 5"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-blue-200 focus:border-blue-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-blue-200 focus:border-blue-400"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              {showNewProject ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter new project name"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewProject(false)}
                    className="text-blue-600 border-blue-200"
                  >
                    Choose Existing
                  </Button>
                </div>
              ) : (
                <Select value={formData.project} onValueChange={handleProjectChange}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Select or create project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                    <SelectItem value="new-project">
                      <span className="text-blue-600">+ Create New Project</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="flex items-center space-x-2">
                      <Flag className="w-4 h-4 text-red-500" />
                      <span>High Priority</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center space-x-2">
                      <Flag className="w-4 h-4 text-yellow-500" />
                      <span>Medium Priority</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center space-x-2">
                      <Flag className="w-4 h-4 text-green-500" />
                      <span>Low Priority</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline || defaultDeadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
                <Input
                  id="estimatedTime"
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 60 })}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            disabled={!formData.title || !formData.deadline}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}