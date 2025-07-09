// components/TaskItem.tsx
import React, { useMemo } from 'react'; // Import useMemo
import { TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, Pencil, Trash2, FolderDot } from 'lucide-react-native'; // Add FolderDot icon

import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

import { cn } from '../lib/utils';
import { Task } from '../store/slices/taskSlice';
import { useSelector } from 'react-redux'; // Import useSelector
import { RootState } from '../store'; // Import RootState

type TaskItemProps = {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  // Fetch all projects to find the linked project's name
  const allProjects = useSelector((state: RootState) => state.projects.projects);

  const projectName = useMemo(() => {
    if (!task.projectId) return null;
    const project = allProjects.find((p) => p.id === task.projectId);
    return project ? project.name : 'Unknown Project';
  }, [task.projectId, allProjects]);

  // Determine color for priority indicator
  const priorityColor =
    task.priority === 'High'
      ? 'border-destructive' // Red
      : task.priority === 'Medium'
      ? 'border-yellow-500' // Yellow
      : 'border-primary'; // Blue/default

  return (
    <ThemedView
      className={cn(
        'flex-row items-center justify-between p-4 my-1 rounded-lg shadow-sm',
        task.completed ? 'bg-green-50 dark:bg-green-950' : 'bg-card',
        `border-l-4 ${priorityColor}`
      )}>
      {/* Left section: Checkbox and Task Details */}
      <ThemedView className="flex-row items-start flex-1 pr-2">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mr-3 mt-1"
        />
        <ThemedView className="flex-1">
          <ThemedText
            className={cn(
              'text-lg font-medium',
              task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            )}>
            {task.title}
          </ThemedText>
          {task.description && (
            <ThemedText
              className={cn(
                'text-sm text-gray-500 dark:text-gray-400',
                task.completed && 'line-through'
              )}
              numberOfLines={1}>
              {task.description}
            </ThemedText>
          )}
          {task.dueDate && (
            <ThemedText className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Due: {task.dueDate}
            </ThemedText>
          )}
          {/* NEW: Display Project Name */}
          {projectName && (
            <ThemedView className="flex-row items-center mt-1">
              <FolderDot size={14} className="text-purple-500 mr-1" />
              <ThemedText className="text-xs text-purple-500">
                {projectName}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {/* Right section: Edit and Delete Buttons */}
      <ThemedView className="flex-row items-center">
        <Button label="" variant="ghost" size="default" onPress={() => onEdit(task)}>
          <Pencil size={20} className="text-muted-foreground" />
        </Button>
        <Button label="" variant="ghost" size="default" onPress={() => onDelete(task.id)}>
          <Trash2 size={20} className="text-destructive" />
        </Button>
      </ThemedView>
    </ThemedView>
  );
}

export default React.memo(TaskItem);