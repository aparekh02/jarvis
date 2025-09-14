import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, Calendar, Flag, Eye, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  deadline: Date;
  estimatedTime: number;
  completed: boolean;
}

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onView, onComplete, onDelete }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const isOverdue = new Date() > task.deadline;
  const isDueToday = new Date().toDateString() === task.deadline.toDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`group hover:shadow-lg transition-all duration-300 border ${
        task.completed 
          ? 'bg-green-50 border-green-200 opacity-75' 
          : isOverdue 
            ? 'bg-red-50 border-red-200' 
            : isDueToday 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-white border-blue-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getPriorityColor(task.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {task.project}
                </Badge>
                {task.completed && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              
              <h3 className={`font-medium mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className={isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-yellow-600 font-medium' : ''}>
                    {formatDeadline(task.deadline)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{task.estimatedTime} min</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(task)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              {!task.completed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComplete(task.id)}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar based on time remaining */}
          {!task.completed && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isOverdue ? 'bg-red-500' : isDueToday ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, 100 - ((new Date().getTime() - new Date(task.deadline).getTime() + 7 * 24 * 60 * 60 * 1000) / (7 * 24 * 60 * 60 * 1000)) * 100))}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}