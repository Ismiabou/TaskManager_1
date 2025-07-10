// app/project-details.tsx
import React, { useCallback, useMemo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { deleteTask, updateTask, Task } from '../store/slices/taskSlice';
import { Project } from '../store/slices/projectSlice'; // Import Project interface

// UI Components
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import TaskItem from '../components/TaskItem'; // Re-use the TaskItem component
import { Button } from '../components/Button'; // Assuming you have a Button component

// Icons
import { ArrowLeft } from 'lucide-react-native';
import { Alert } from 'react-native';

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const params = useLocalSearchParams();
  const projectId = params.projectId as string; // Get the project ID from navigation params

  // Select all projects and all tasks from the Redux store
  const projects = useSelector((state: RootState) => state.projects.projects);
  const allTasks = useSelector((state: RootState) => state.tasks.items);

  // Find the current project based on the projectId from params
  const currentProject: Project | undefined = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projectId, projects]);

  // Filter tasks that belong to the current project
  const projectTasks: Task[] = useMemo(() => {
    return allTasks.filter((task) => task.projectId === projectId);
  }, [projectId, allTasks]);

  // Handlers for tasks (re-using logic from index.tsx or task-modal.tsx)
  const handleToggleCompleted = useCallback(
    (taskToToggle: Task) => {
      // Accept the full task object
      if (!projectId) {
        Alert.alert('Error', 'No project selected.');
        return;
      }

      // Determine the new status based on the current status
      const newStatus = taskToToggle.status === 'done' ? 'to-do' : 'done';
      dispatch(
        updateTask({
          projectId: projectId,
          taskId: taskToToggle.id,
          updates: {
            status: newStatus,
            // updatedAt is handled by serverTimestamp in the thunk
          },
        })
      );
    },
    [dispatch, projectId]
  );

  const handleDeleteTask = useCallback(
     (taskToToggle: Task) => {
      // Accept the full task object
      if (!projectId) {
        Alert.alert('Error', 'No project selected.');
        return;
      }
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask({
              taskId: taskToToggle.id,
              projectId: projectId,
            }));
          },
        },
      ]);
    },
    [dispatch]
  );

  const handleEditTask = useCallback(
    (task: Task) => {
      router.push({
        pathname: '/task-modal',
        params: { taskId: task.id },
      });
    },
    [router]
  );

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        onToggleComplete={() => handleToggleCompleted(item)}
        onEdit={handleEditTask}
        onDelete={() => handleDeleteTask(item)}
      />
    ),
    [handleToggleCompleted, handleEditTask, handleDeleteTask]
  );

  if (!currentProject) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-background p-4 dark:bg-foreground">
        <ThemedText className="text-lg text-destructive">Project not found.</ThemedText>
        <Button label="Go Back" onPress={() => router.back()} className="mt-4" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-background p-4 pt-12 dark:bg-foreground">
      {/* Custom Header */}
      <ThemedView className="flex-row items-center border-b border-gray-200 pb-4 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()} className="mr-2 p-2">
          <ArrowLeft size={24} className="text-foreground dark:text-background" />
        </TouchableOpacity>
        <ThemedText
          type="title"
          className="flex-1 font-poppinsBold text-foreground dark:text-background">
          {currentProject.name}
        </ThemedText>
      </ThemedView>

      {currentProject.description && (
        <ThemedText className="mb-4 mt-4 text-base text-muted-foreground">
          {currentProject.description}
        </ThemedText>
      )}

      <ThemedText type="subtitle" className="mb-2 mt-4 text-foreground">
        Tasks for this Project ({projectTasks.length})
      </ThemedText>

      <FlatList
        data={projectTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <ThemedView className="mt-10 flex-1 items-center justify-center">
            <ThemedText className="text-lg text-muted-foreground">
              No tasks assigned to this project yet.
            </ThemedText>
            {/* Optional: Button to add a new task directly to this project */}
            {/* <Button label="Add New Task" onPress={() => router.push({pathname: '/task-modal', params: { projectId: currentProject.id }})} className="mt-4" /> */}
          </ThemedView>
        }
      />
    </ThemedView>
  );
}
