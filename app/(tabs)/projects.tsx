// app/(tabs)/projects.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  listenToProjects, // Corrected import
  createProject, // Corrected import
  updateProject, // Corrected import
  deleteProject, // Corrected import
  setSelectedProject, // Import setSelectedProject
  Project, // Make sure you import the Project interface
} from '../../store/slices/projectSlice';

// UI Components
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog, DialogContent } from '../../components/Dialog';
import { Label } from '../../components/Label';

// Icons
import { FolderPlus, Pencil, Trash2 } from 'lucide-react-native';

// Component for a single project item (could be in components/ProjectItem.tsx)
const ProjectItem = React.memo(
  ({
    project,
    onPress,
    onEdit,
    onDelete,
  }: {
    project: { id: string; name: string; description?: string };
    onPress: (project: { id: string; name: string; description?: string }) => void; // Pass whole project
    onEdit: (project: { id: string; name: string; description?: string }) => void;
    onDelete: (id: string) => void;
  }) => {
    return (
      <ThemedView className="mb-3 flex-row items-center justify-between rounded-lg bg-card p-4 shadow-sm">
        <TouchableOpacity onPress={() => onPress(project)} className="flex-1">
          <ThemedText className="font-poppinsSemiBold text-lg text-foreground">
            {project.name}
          </ThemedText>
          {project.description && (
            <ThemedText className="text-sm text-muted-foreground">{project.description}</ThemedText>
          )}
        </TouchableOpacity>
        <ThemedView className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => onEdit(project)} className="h-8 w-8">
            <Pencil size={20} className="text-primary" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(project.id)} className="h-8 w-8">
            <Trash2 size={20} className="text-destructive" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }
);

export default function ProjectsScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const projects = useSelector((state: RootState) => state.projects.projects);
  const projectsLoading = useSelector((state: RootState) => state.projects.loading);
  const projectsError = useSelector((state: RootState) => state.projects.error);
  const currentUserId = useSelector((state: RootState) => state.auth.uid); // Get current user's UID

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Effect to listen to projects for the current user
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (currentUserId) {
      dispatch(listenToProjects(currentUserId)).then((action) => {
        if (listenToProjects.fulfilled.match(action)) {
          unsubscribe = action.payload;
        }
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, currentUserId]);

  // Display error if any
  useEffect(() => {
    if (projectsError) {
      Alert.alert('Project Error', projectsError);
      // Optionally clear the error after showing it
      // dispatch(setError(null)); // You would need to import setError action from projectSlice
    }
  }, [projectsError]);

  const handleOpenModal = useCallback((project: Project | null = null) => {
    setEditingProject(project);
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    } else {
      setProjectName('');
      setProjectDescription('');
    }
    setIsProjectModalOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setProjectName('');
    setProjectDescription('');
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Project name cannot be empty.');
      return;
    }
    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated. Cannot create/update project.');
      return;
    }

    try {
      if (editingProject) {
        // Update existing project
        await dispatch(
          updateProject({
            projectId: editingProject.id,
            updates: {
              name: projectName.trim(),
              description: projectDescription.trim(),
            },
          })
        ).unwrap();
        Alert.alert('Success', 'Project updated successfully!');
      } else {
        // Create new project
        await dispatch(
          createProject({
            name: projectName.trim(),
            description: projectDescription.trim(),
            ownerId: currentUserId,
            // default members and status handled in thunk
          })
        ).unwrap();
        Alert.alert('Success', 'Project created successfully!');
      }
      handleCancel();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save project.');
    }
  }, [projectName, projectDescription, editingProject, currentUserId, dispatch, handleCancel]);

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      Alert.alert('Delete Project', 'Are you sure you want to delete this project?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProject(projectId)).unwrap(); // Pass only projectId
              Alert.alert('Success', 'Project deleted!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete project.');
            }
          },
        },
      ]);
    },
    [dispatch]
  );

  const handleProjectPress = useCallback(
    async (project: Project) => {
      // Set the selected project in Redux and navigate to tasks screen
      dispatch(setSelectedProject(project));
      router.push('/(tabs)/index'); // Navigate to the tasks screen
    },
    [dispatch, router]
  );

  const renderProjectItem = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectItem
        project={item}
        onPress={() => handleProjectPress}
        onEdit={() => handleOpenModal(item)}
        onDelete={handleDeleteProject}
      />
    ),
    [handleProjectPress, handleOpenModal, handleDeleteProject]
  );

  return (
    <ThemedView className="flex-1 bg-background dark:bg-foreground">
      <ThemedView className="flex-row items-center justify-between border-b border-gray-200 bg-background p-4 dark:border-gray-700 dark:bg-foreground">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          My Projects
        </ThemedText>
        <TouchableOpacity onPress={() => handleOpenModal()}>
          <FolderPlus size={20} className="text-primary-foreground" />
        </TouchableOpacity>
      </ThemedView>

      {projectsLoading && projects.length === 0 ? ( // Show loading indicator only if no projects loaded yet
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <ThemedText className="mt-4 text-muted-foreground">Loading projects...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <ThemedView className="mt-20 flex-1 items-center justify-center">
              <ThemedText className="text-lg text-muted-foreground">
                No projects found. Add a new project!
              </ThemedText>
            </ThemedView>
          }
        />
      )}

      {/* Add/Edit Project Dialog */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <ThemedView className="border-b border-gray-200 p-4 dark:border-gray-700">
            <ThemedText className="font-poppinsSemiBold text-lg text-foreground">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </ThemedText>
            <ThemedText className="text-sm text-muted-foreground">
              {editingProject
                ? 'Make changes to your project.'
                : 'Add a new project to organize your tasks.'}
            </ThemedText>
          </ThemedView>
          <ThemedView className="py-4">
            <ThemedView className="mb-4">
              <Label htmlFor="projectName" className="mb-1 text-foreground">
                Name
              </Label>
              <Input
                id="projectName"
                placeholder="e.g., Work Projects"
                value={projectName}
                onChangeText={setProjectName}
                className="text-foreground"
              />
            </ThemedView>
            <ThemedView className="mb-4">
              <Label htmlFor="projectDescription" className="mb-1 text-foreground">
                Description (Optional)
              </Label>
              <Input
                id="projectDescription"
                placeholder="Brief description of the project"
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline
                numberOfLines={3}
                className="h-20 text-foreground"
              />
            </ThemedView>
          </ThemedView>
          <ThemedView className="flex flex-col-reverse justify-end border-t border-gray-200 p-4 sm:flex-row sm:space-x-2">
            <Button label="Cancel" variant="destructive" onPress={handleCancel} />
            <Button label="Save Project" onPress={handleSaveProject} />
          </ThemedView>
        </DialogContent>
      </Dialog>
    </ThemedView>
  );
}
