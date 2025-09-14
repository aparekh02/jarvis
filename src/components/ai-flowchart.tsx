import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, ArrowDown, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: Date;
  estimatedTime: number;
  project: string;
}

interface FlowchartNode {
  id: string;
  task: Task;
  recommendedStart: string;
  duration: string;
  reasoning: string;
  position: number;
}

interface AIFlowchartProps {
  tasks: Task[];
}

export function AIFlowchart({ tasks }: AIFlowchartProps) {
  const [flowchartNodes, setFlowchartNodes] = useState<FlowchartNode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (tasks.length > 0) {
      generateOptimalFlowchart(tasks);
    }
  }, [tasks]);

  const generateOptimalFlowchart = async (taskList: Task[]) => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI algorithm to optimize task order
    const sortedTasks = [...taskList].sort((a, b) => {
      // Priority weight (high = 3, medium = 2, low = 1)
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      
      // Deadline urgency (closer deadline = higher urgency)
      const now = new Date();
      const urgencyA = (a.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24); // days until deadline
      const urgencyB = (b.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      // Combined score (priority + urgency + time estimation)
      const scoreA = priorityWeight[a.priority] * 10 + (10 - Math.min(urgencyA, 10)) + (5 - Math.min(a.estimatedTime / 60, 5));
      const scoreB = priorityWeight[b.priority] * 10 + (10 - Math.min(urgencyB, 10)) + (5 - Math.min(b.estimatedTime / 60, 5));
      
      return scoreB - scoreA;
    });

    const nodes: FlowchartNode[] = sortedTasks.map((task, index) => {
      const startTime = new Date();
      startTime.setHours(9 + (index * 2)); // Start at 9 AM, 2-hour gaps
      
      const reasoning = generateReasoning(task, index, sortedTasks.length);
      
      return {
        id: task.id,
        task,
        recommendedStart: startTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        duration: `${task.estimatedTime} min`,
        reasoning,
        position: index
      };
    });

    setFlowchartNodes(nodes);
    setIsGenerating(false);
  };

  const generateReasoning = (task: Task, position: number, total: number): string => {
    const reasons = [];
    
    if (task.priority === 'high') {
      reasons.push("High priority task");
    }
    
    const daysUntilDeadline = Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline <= 2) {
      reasons.push("Urgent deadline");
    }
    
    if (task.estimatedTime <= 30) {
      reasons.push("Quick completion");
    } else if (task.estimatedTime >= 120) {
      reasons.push("Requires focus time");
    }
    
    if (position === 0) {
      reasons.push("Best morning energy");
    } else if (position === total - 1) {
      reasons.push("End of day task");
    }

    return reasons.join(" • ") || "Optimal scheduling";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>AI Study Flowchart</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <p>Add tasks to generate your optimal study timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-white border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <span>AI Study Flowchart</span>
          {isGenerating && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {isGenerating ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <p className="text-blue-700 font-medium">AI is optimizing your study timeline...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flowchartNodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">{node.recommendedStart}</span>
                          <Badge variant="outline" className="text-xs">
                            {node.duration}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{node.task.title}</h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getPriorityColor(node.task.priority)}>
                            {node.task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {node.task.project}
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          🤖 {node.reasoning}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {index < flowchartNodes.length - 1 && (
                  <div className="flex justify-center my-2">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowDown className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        {!isGenerating && flowchartNodes.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200 mt-4">
            <CardContent className="p-3">
              <p className="text-sm text-blue-800 text-center">
                ✨ This timeline is optimized based on priority, deadlines, and estimated completion time
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}