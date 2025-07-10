// app/project-modal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { Project,updateProject,deleteProject,clearProjects,createProject } from '../store/slices/projectSlice'

// Icons
import { X } from 'lucide-react-native';
import { Timestamp } from 'firebase/firestore';

export default function ProjectModalScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const params = useLocalSearchParams();
  const projectId = params.projectId as string | undefined;

  const existingProject = useSelector((state: RootState) =>
    projectId ? state.projects.projects.find((p) => p.id === projectId) : undefined
  );
  const userId = useSelector((state: RootState) => state.auth.uid);
  const [name, setName] = useState(existingProject?.name || '');
  const [description, setDescription] = useState(existingProject?.description || '');

  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setDescription(existingProject.description || '');
    }
  }, [existingProject]);

  const handleSaveProject = useCallback(async () => {

    if (!name.trim()) {
      Alert.alert('Error', 'Project name cannot be empty.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (existingProject) {
      // Update existing project
      const updatedProject: Project = {
        ...existingProject,
        name: name.trim(),
        description: description.trim() || undefined, // Allow description to be optional
      };
      await dispatch(updateProject({
        projectId: existingProject.id,
        updates: updatedProject,
      }));
    } else {
      const newProjectData: {name: string; description?: string; ownerId: string} = {
        name: name.trim(),
        description: description.trim() || undefined,
        ownerId: userId, // Use ownerId for consistency with other parts of the app
      };
      await dispatch(createProject( newProjectData)); // Corrected key from 'projectData' to 'project'
    }

    router.back(); // Go back after saving
  }, [name, description, existingProject, userId, dispatch, router]);

  return (
    <ThemedView className="flex-1 p-4 pt-12">
      <ThemedView className="flex-row items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          {existingProject ? 'Edit Project' : 'New Project'}
        </ThemedText>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} className="text-foreground" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView className="mt-4 flex-1">
        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">Project Name</ThemedText>
          <Input
            placeholder="e.g., My Portfolio Website"
            value={name}
            onChangeText={setName}
            className="text-foreground"
          />
        </ThemedView>

        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">
            Description (Optional)
          </ThemedText>
          <Input
            placeholder="Detailed description of the project"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="h-24 text-foreground"
          />
        </ThemedView>
      </ScrollView>

      <Button
        label="Save Project"
        size="default"
        onPress={handleSaveProject}
        className="mt-4 w-full"
      />
    </ThemedView>
  );
}