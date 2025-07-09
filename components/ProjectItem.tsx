// components/ProjectItem.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FolderPen, FolderX } from 'lucide-react-native'; // Icons for edit and delete

import { Button } from './Button';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

import { cn } from '../lib/utils';
import { Project } from '../store/slices/projectSlice'; // Make sure Project type is consistent

type ProjectItemProps = {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onPress?: (project: Project) => void; // Add this prop for navigation
};

function ProjectItem({ project, onEdit, onDelete, onPress }: ProjectItemProps) {
  return (
    <TouchableOpacity // Wrap the main content with TouchableOpacity
      onPress={() => onPress && onPress(project)} // Call onPress if provided
      activeOpacity={0.8} // Give some feedback on press
      className={cn(
        'flex-row items-center justify-between p-4 my-1 rounded-lg shadow-sm bg-card',
        'border-l-4 border-purple-500' // Example border color for projects
      )}>
      {/* Left section: Project Details */}
      <ThemedView className="flex-1 pr-2">
        <ThemedText className="text-lg font-medium text-foreground dark:text-background">
          {project.name}
        </ThemedText>
        {project.description && (
          <ThemedText
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            numberOfLines={1}>
            {project.description}
          </ThemedText>
        )}
        <ThemedText className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </ThemedText>
      </ThemedView>

      {/* Right section: Edit and Delete Buttons */}
      <ThemedView className="flex-row items-center">
        <Button label="" variant="ghost" size="default" onPress={() => onEdit(project)}>
          <FolderPen size={20} className="text-muted-foreground" />
        </Button>
        <Button label="" variant="ghost" size="default" onPress={() => onDelete(project.id)}>
          <FolderX size={20} className="text-muted-foreground" />
        </Button>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default ProjectItem;