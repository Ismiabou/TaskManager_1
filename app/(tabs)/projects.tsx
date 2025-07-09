// app/(tabs)/projects.tsx
import React, { useCallback, useState } from 'react';
import { FlatList, TouchableOpacity, Alert } from 'react-native'; // Import Alert
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchProjects,
  addProjectAsync,
  updateProjectAsync,
  deleteProjectAsync,
  Project, // Make sure you import the Project interface too
} from '../../store/slices/projectSlice'; // This should be a named import of thunks // Import deleteProject action

// UI Components
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input'; // For adding new project
import { Dialog, DialogContent } from '../../components/Dialog'; // For add/edit project dialog
import { Label } from '../../components/Label'; // For RadioGroup items

// Icons
import { FolderPlus, Pencil, Trash2 } from 'lucide-react-native'; // Add FolderPlus

// Component for a single project item (could be in components/ProjectItem.tsx)
const ProjectItem = React.memo(({ project, onPress, onEdit, onDelete }: { project: { id: string, name: string, description?: string }, onPress: (id: string) => void, onEdit: (project: { id: string, name: string, description?: string }) => void, onDelete: (id: string) => void }) => {
  return (
    <ThemedView className="flex-row items-center justify-between p-4 my-1 rounded-lg bg-card border-l-4 border-primary shadow-sm">
      <TouchableOpacity onPress={() => onPress(project.id)} className="flex-1 pr-2">
        <ThemedText className="text-lg font-medium text-foreground">{project.name}</ThemedText>
        {project.description && (
          <ThemedText className="text-sm text-muted-foreground" numberOfLines={1}>{project.description}</ThemedText>
        )}
      </TouchableOpacity>
      <ThemedView className="flex-row items-center">
        <Button label="" variant="ghost" size="default" onPress={() => onEdit(project)}>
          <Pencil size={20} className="text-muted-foreground" />
        </Button>
        <Button label="" variant="ghost" size="default" onPress={() => onDelete(project.id)}>
          <Trash2 size={20} className="text-destructive" />
        </Button>
      </ThemedView>
    </ThemedView>
  );
});


export default function ProjectsScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id?: string; name: string; description?: string } | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleOpenProjectModal = useCallback((project?: { id?: string; name: string; description?: string }) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    } else {
      setEditingProject(null);
      setProjectName('');
      setProjectDescription('');
    }
    setIsProjectModalOpen(true);
  }, []);

  const handleSaveProject = useCallback(() => {
    if (!projectName.trim()) {
      Alert.alert('Input Required', 'Project name cannot be empty.');
      return;
    }

    const projectData = {
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
    };

    if (editingProject?.id) {
      // Update existing project
      dispatch({
        type: 'projects/updateProject',
        payload: {
          id: editingProject.id,
          ...projectData,
          createdAt: (editingProject as any).createdAt, // Preserve original createdAt if available
          updatedAt: new Date().toISOString(),
        },
      });
      Alert.alert('Success', 'Project updated successfully!');
    } else {
      // Add new project
      dispatch({
        type: 'projects/addProject',
        payload: projectData,
      });
      Alert.alert('Success', 'Project added successfully!');
    }
    setIsProjectModalOpen(false);
    setProjectName('');
    setProjectDescription('');
  }, [projectName, projectDescription, editingProject, dispatch]);


 const handleDeleteProject = useCallback(async (id: string) => {
  Alert.alert(
    'Delete Project',
    'Are you sure you want to delete this project? All associated tasks will also be removed.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          if (!userId) {
              Alert.alert('Error', 'User not authenticated.');
              return;
          }
          // This is the correct way to dispatch the async thunk:
          await dispatch(deleteProjectAsync(id));
        },
      },
    ],
    { cancelable: true }
  );
}, [dispatch, userId]);


  const handlePressProject = useCallback((id: string) => {
    router.push({
      pathname: '/project-details',
      params: { projectId: id }, // Pass the project ID
    });
  }, [router]);

  const renderProjectItem = useCallback(
    ({ item }: { item: { id: string; name: string; description?: string } }) => (
      <ProjectItem
        project={item}
        onPress={handlePressProject}
        onEdit={handleOpenProjectModal}
        onDelete={handleDeleteProject}
      />
    ),
    [handlePressProject, handleOpenProjectModal, handleDeleteProject]
  );


  return (
    <ThemedView className="flex-1 bg-background p-4 pt-12">
      <ThemedView className="flex-row items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          My Projects
        </ThemedText>
        <Button label="" size="default" onPress={() => handleOpenProjectModal()} className="flex-row items-center">
          <FolderPlus size={24} className="text-primary-foreground mr-1" />
          <ThemedText className="text-primary-foreground">New</ThemedText>
        </Button>
      </ThemedView>

      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        ListEmptyComponent={
          <ThemedView className="mt-20 flex-1 items-center justify-center">
            <ThemedText className="text-lg text-muted-foreground">
              No projects yet! Create one above.
            </ThemedText>
          </ThemedView>
        }
      />

      {/* Project Add/Edit Dialog */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <ThemedView className="flex flex-col space-y-1.5 text-center">
            <ThemedText className="text-lg font-semibold leading-none tracking-tight">
              {editingProject ? 'Edit Project' : 'New Project'}
            </ThemedText>
            <ThemedText className="text-sm text-muted-foreground">
              {editingProject ? 'Make changes to your project.' : 'Add a new project to organize your tasks.'}
            </ThemedText>
          </ThemedView>
          <ThemedView className="py-4">
            <ThemedView className="mb-4">
              <Label htmlFor="projectName" className="text-foreground mb-1">Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Work Projects"
                value={projectName}
                onChangeText={setProjectName}
                className="text-foreground"
              />
            </ThemedView>
            <ThemedView className="mb-4">
              <Label htmlFor="projectDescription" className="text-foreground mb-1">Description (Optional)</Label>
              <Input
                id="projectDescription"
                placeholder="Brief description of the project"
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline
                numberOfLines={3}
                className="text-foreground h-20"
              />
            </ThemedView>
          </ThemedView>
          <ThemedView className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button label="Cancel" variant="destructive" onPress={() => setIsProjectModalOpen(false)} />
            <Button label="Save Project" onPress={handleSaveProject} />
          </ThemedView>
        </DialogContent>
      </Dialog>
    </ThemedView>
  );
}