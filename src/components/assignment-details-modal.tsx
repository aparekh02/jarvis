import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar, Clock, Flag, BookOpen, Target, CheckCircle, Play } from 'lucide-react';
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

interface AssignmentDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
}

export function AssignmentDetailsModal({ 
  task, 
  isOpen, 
  onClose, 
  onComplete, 
  onStartTimer 
}: AssignmentDetailsModalProps) {
  if (!task) return null;

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
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-yellow-600' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-orange-600' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-600' };
    }
  };

  const deadlineInfo = formatDeadline(task.deadline);

  // Generate AI-powered suggestions
  const suggestions = [
    "Break this task into 25-minute focused sessions with 5-minute breaks",
    "Start with reviewing related concepts for 10 minutes",
    "Create an outline before diving into the main work",
    "Set up a distraction-free environment for optimal focus"
  ];

  const relatedResources = [
    "Chapter 5 Study Guide",
    "Practice Problems Solution Set",
    "Video Tutorial: Advanced Topics",
    "Previous Assignment Examples"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 pr-6">Assignment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{task.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority} priority
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {task.project}
                    </Badge>
                    {task.completed && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Deadline</p>
                    <p className={`text-sm ${deadlineInfo.color} font-medium`}>
                      {task.deadline.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {deadlineInfo.text}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Estimated Time</p>
                    <p className="text-sm text-gray-700">
                      {task.estimatedTime} minutes ({Math.round(task.estimatedTime / 60 * 10) / 10} hours)
                    </p>
                  </div>
                </div>
              </div>

              {task.description && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">AI Study Recommendations</h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-blue-200"
                  >
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedResources.map((resource, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{resource}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!task.completed && (
              <>
                <Button
                  onClick={() => onStartTimer(task)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Focus Timer
                </Button>
                
                <Button
                  onClick={() => onComplete(task.id)}
                  variant="outline"
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              </>
            )}
            
            {task.completed && (
              <div className="flex-1 bg-green-100 text-green-800 border border-green-200 rounded-lg p-3 text-center">
                <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                <p className="font-medium">Task Completed!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}