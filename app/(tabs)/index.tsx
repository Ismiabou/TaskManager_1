// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { Loader2, PlusCircle } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Dialog, DialogContent } from '../../components/Dialog';
import { Input } from '../../components/Input';
import { ThemedText } from './../../components/ThemedText';
import { ThemedView } from './../../components/ThemedView';
import { cn } from '../../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  listenToTasks, // Corrected import for fetching tasks
  createTask, // Corrected import for adding a task
  updateTask, // Corrected import for updating
  deleteTask, // Corrected import for deleting
  Task,
} from '../../store/slices/taskSlice';
import { listenToProjects } from '../../store/slices/projectSlice'; // Import listenToProjects
import { useRouter } from 'expo-router';
import TaskItem from '../../components/TaskItem';

export default function TasksScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState(''); // Added for new task description
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProjectIdInModal, setSelectedProjectIdInModal] = useState<string | undefined>(undefined); // New state for project selection in modal


  const dispatch: AppDispatch = useDispatch();

  // Corrected selectors for tasks state
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const tasksLoading = useSelector((state: RootState) => state.tasks.loading);
  const tasksError = useSelector((state: RootState) => state.tasks.error);
  const userId = useSelector((state: RootState) => state.auth.uid); // Get current user ID from auth state
  // Selector for selected project ID and current user ID
  const selectedProject = useSelector((state: RootState) => state.projects.selectedProject);
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const projectId = selectedProject?.id;

  const projects = useSelector((state: RootState) => state.projects.projects);
  const projectsLoading = useSelector((state: RootState) => state.projects.loading);
  const projectsError = useSelector((state: RootState) => state.projects.error);

  const router = useRouter();

  // Listen to tasks for the selected project
  useEffect(() => { 
    let unsubscribe: (() => void) | undefined;
    if (projectId) {
      // Dispatch the listenToTasks thunk and store the unsubscribe function
      dispatch(listenToTasks(userId || "")).then((action) => {
        if (listenToTasks.fulfilled.match(action)) {
          unsubscribe = action.payload; // Store the unsubscribe function
        }
      });
    }
    // Cleanup: Unsubscribe when component unmounts or projectId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, projectId]); // Re-run effect if dispatch or projectId changes

  // Listen to projects
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    // Dispatch the listenToProjects thunk and store the unsubscribe function
    dispatch(listenToProjects("")).then((action) => {
      if (listenToProjects.fulfilled.match(action)) {
        unsubscribe = action.payload; // Store the unsubscribe function
      }
    });
    // Cleanup: Unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch]);

  // Set default selected project in modal when projects load or projectId changes
  useEffect(() => {
    if (projectId && !editingTask) { // Only set default when adding new task
      setSelectedProjectIdInModal(projectId);
    } else if (editingTask && editingTask.projectId) { // When editing, set to task's project
      setSelectedProjectIdInModal(editingTask.projectId);
    }
  }, [projectId, editingTask, projects]); // Depend on projects to ensure they are loaded


  // Display error if any
  useEffect(() => {
    if (tasksError) {
      Alert.alert('Task Error', tasksError);
      // Optionally clear the error after showing it
      // dispatch(setError(null)); // You would need to import setError action from taskSlice
    }
    if (projectsError) {
      Alert.alert('Project Error', projectsError);
    }
  }, [tasksError, projectsError]);

  const handleOpenModal = useCallback((task: Task | null = null) => {
    setEditingTask(task);
    if (task) {
      setNewTaskTitle(task.title);
      setNewTaskDescription(task.description || ''); // Populate description for editing
      setSelectedProjectIdInModal(task.projectId); // Set selected project when editing
    } else {
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedProjectIdInModal(projectId); // Default to current project when adding
    }
    setIsModalOpen(true);
  }, [projectId]);

  const handleCancelEdit = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setSelectedProjectIdInModal(undefined); // Reset selected project in modal
    Keyboard.dismiss();
  }, []);

  const handleAddTask = useCallback(async () => {
    if (!selectedProjectIdInModal) { // Use selectedProjectIdInModal
      Alert.alert('Error', 'Please select a project for the new task.');
      return;
    }
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Task title cannot be empty.');
      return;
    }
    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      return;
    }

    try {
      await dispatch(
        createTask({
          projectId: selectedProjectIdInModal, // Use selectedProjectIdInModal
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim(), // Include description
          assignedTo: [], // Default empty
          dueDate: undefined, // Default undefined
          priority: 'medium', // Default priority
          createdBy: currentUserId,
        })
      ).unwrap(); // unwrap to handle success/failure directly

      Alert.alert('Success', 'Task added!');
      handleCancelEdit();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add task.');
    }
  }, [selectedProjectIdInModal, newTaskTitle, newTaskDescription, currentUserId, dispatch, handleCancelEdit]);

  const handleSaveEditedTask = useCallback(async () => {
    if (!editingTask || !selectedProjectIdInModal) { // Use selectedProjectIdInModal
      Alert.alert('Error', 'No task selected for editing or no project selected.');
      return;
    }
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Task title cannot be empty.');
      return;
    }

    try {
      await dispatch(
        updateTask({
          projectId: editingTask.projectId, // Keep original project ID for update
          taskId: editingTask.id,
          updates: {
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            // If you want to allow changing the project of an existing task,
            // you'll need more complex logic here, possibly involving
            // deleting from the old project and re-adding to the new one.
            // For now, we assume projectId doesn't change on edit.
            // updatedAt is handled by serverTimestamp in the thunk
          },
        })
      ).unwrap();

      Alert.alert('Success', 'Task updated!');
      handleCancelEdit();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task.');
    }
  }, [editingTask, selectedProjectIdInModal, newTaskTitle, newTaskDescription, dispatch, handleCancelEdit]);

  const handleToggleComplete = useCallback(
    async (taskToToggle: Task) => {
      if (!projectId) {
        Alert.alert('Error', 'No project selected.');
        return;
      }

      // Toggle status between 'to-do' and 'done'
      const newStatus = taskToToggle.status === 'done' ? 'to-do' : 'done';

      try {
        await dispatch(
          updateTask({
            projectId: projectId,
            taskId: taskToToggle.id,
            updates: {
              status: newStatus,
              // updatedAt is handled by serverTimestamp in the thunk
            },
          })
        ).unwrap();
        // No alert needed, UI will update via listener
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to update task status.');
      }
    },
    [dispatch, projectId]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!projectId) {
        Alert.alert('Error', 'No project selected.');
        return;
      }

      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTask({ projectId: projectId, taskId: taskId })).unwrap();
              Alert.alert('Success', 'Task deleted!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete task.');
            }
          },
        },
      ]);
    },
    [dispatch, projectId]
  );

  const handleEditTask = useCallback(
    (task: Task) => {
      handleOpenModal(task);
    },
    [handleOpenModal]
  );

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        onToggleComplete={() => handleToggleComplete(item)}
        onEdit={() => handleEditTask(item)}
        onDelete={() => handleDeleteTask(item.id)}
      />
    ),
    [handleToggleComplete, handleEditTask, handleDeleteTask]
  );

  // Filter tasks to show only 'to-do' and 'in-progress'
  const currentTasks = tasks.filter(
    (task) => task.status === 'to-do' || task.status === 'in-progress' || task.status === 'blocked'
  );

  return (
    <ThemedView className="flex-1 items-center bg-background dark:bg-foreground">
      <ThemedView className="flex-row items-center justify-between border-b border-gray-200 bg-background p-4 dark:border-gray-700 dark:bg-foreground">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          My Tasks
        </ThemedText>
        <TouchableOpacity
          className={cn('h-9 w-9 rounded-full p-2')}
          onPress={() => handleOpenModal()}>
          <PlusCircle size={20} className="text-primary-foreground" />
        </TouchableOpacity>
      </ThemedView>

      {tasksLoading && currentTasks.length === 0 ? ( // Show loading indicator only if no tasks loaded yet
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <ThemedText className="mt-4 text-muted-foreground">Loading tasks...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={currentTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <ThemedView className="mt-20 flex-1 items-center justify-center">
              <ThemedText className="text-lg text-muted-foreground">
                No active tasks found. Add a new task!
              </ThemedText>
            </ThemedView>
          }
        />
      )}

      {/* Add Task / Edit Task Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <ThemedView className="border-b border-gray-200 p-4 dark:border-gray-700">
            <ThemedText className="font-poppinsSemiBold text-lg text-foreground">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </ThemedText>
            <ThemedText className="text-sm text-muted-foreground">
              {editingTask ? 'Make changes to your task here.' : 'Enter details for your new task.'}
            </ThemedText>
          </ThemedView>

          <ThemedView className="gap-4 p-4">
            <ThemedView className="mb-4">
              <ThemedText className="text-right text-sm font-medium text-foreground">
                Title
              </ThemedText>
              <Input
                id="taskTitle"
                className="mt-2 h-12"
                placeholder="Task title"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
            </ThemedView>

            <ThemedView className="mb-4">
              <ThemedText className="text-right text-sm font-medium text-foreground">
                Description (Optional)
              </ThemedText>
              <Input
                id="taskDescription"
                className="mt-2 h-20"
                placeholder="Details about the task"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
                numberOfLines={3}
              />
            </ThemedView>

            <ThemedView className="mb-4">
              <ThemedText className="text-right text-sm font-medium text-foreground">
                Project
              </ThemedText>
              {projectsLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Picker
                  selectedValue={selectedProjectIdInModal}
                  onValueChange={(itemValue:string | undefined) => setSelectedProjectIdInModal(itemValue)}
                  // You might need to adjust styling for the Picker to match your theme
                  style={{ height: 50, width: '100%', color: 'white' }}
                  itemStyle={{ color: 'black' }} // This might not work on all platforms for text color
                >
                  {projects.length === 0 && (
                    <Picker.Item label="No projects available" value={null} enabled={false} />
                  )}
                  {projects.map((project) => (
                    <Picker.Item key={project.id} label={project.name} value={project.id} />
                  ))}
                </Picker>
              )}
            </ThemedView>
          </ThemedView>

          {/* DialogFooter */}
          <ThemedView className="flex flex-col-reverse border-t border-gray-200 p-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-gray-700">
            <TouchableOpacity onPress={handleCancelEdit}>
              <ThemedText className="text-destructive">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={editingTask ? handleSaveEditedTask : handleAddTask}>
              <ThemedText>{editingTask ? 'Save Changes' : 'Add Task'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </DialogContent>
      </Dialog>
    </ThemedView>
  );
}