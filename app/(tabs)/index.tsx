// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard } from 'react-native';
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
  fetchTasks, // Import the thunk for loading tasks
  addTaskAsync, // Import the thunk for adding a task
  updateTaskAsync, // Import the thunk for updating
  deleteTaskAsync, // Import the thunk for deleting
  Task,
} from '../../store/slices/taskSlice';
import { useRouter } from 'expo-router';
import TaskItem from '../../components/TaskItem';

export default function TasksScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const taskStatus = useSelector((state: RootState) => state.tasks.status);
  const taskError = useSelector((state: RootState) => state.tasks.error);
  const router = useRouter();

  // --- NEW: Get userId from auth slice ---
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authStatus = useSelector((state: RootState) => state.auth.status);

  // --- NEW: Fetch tasks when component mounts or userId changes ---
  useEffect(() => {
    // Only attempt to fetch tasks if authenticated and userId is available
    if (isAuthenticated && userId && authStatus === 'succeeded') {
      dispatch(fetchTasks(userId));
    }
  }, [dispatch, userId, isAuthenticated, authStatus]); // Re-run effect if userId or auth status changes

  // Handle adding a new task
const handleAddTask = useCallback(async () => {
    if (newTaskTitle.trim() === '' || !userId) {
      Alert.alert('Error', 'Task title cannot be empty or user not authenticated.');
      return;
    }

    // This object should NOT contain 'completed', 'id', 'createdAt', 'updatedAt', 'userId'
    const taskToAdd = {
      title: newTaskTitle.trim(),
      priority: 'Low' as Task['priority'],
      completed:false // Example: set a default priority
      // If you have other fields like description or dueDate from your form, add them here
      // description: 'Some description',
      // dueDate: new Date().toISOString(),
    };

    Keyboard.dismiss();
    await dispatch(addTaskAsync({ task: taskToAdd, userId})); // Dispatch the addTaskAsync thunk
    setNewTaskTitle('');
    setIsModalOpen(false);
}, [dispatch, newTaskTitle, userId]);

  // Handle saving edited task
  const handleSaveEditedTask = useCallback(async () => {
    if (!editingTask || !editingTask.title.trim()) {
      Alert.alert('Error', 'Task title cannot be empty.');
      return;
    }
    // Dispatch the updateTaskAsync thunk
    await dispatch(updateTaskAsync(editingTask));
    setEditingTask(null); // Clear editing task state
    setIsModalOpen(false); // Close the modal
  }, [dispatch, editingTask]);

  // Handle deleting a task
  const handleDeleteTask = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            await dispatch(deleteTaskAsync(id)); // Dispatch the async thunk
          },
        },
      ],
      { cancelable: true }
    );
  }, [dispatch]);

  // Handle toggling task completion status
  const handleToggleTaskCompleted = useCallback(async (task: Task) => {
    // Dispatch updateTaskAsync with the toggled completed status
    await dispatch(updateTaskAsync({ ...task, completed: !task.completed, updatedAt: new Date().toISOString() }));
  }, [dispatch]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(false);
  }, []);

  const isLoading = taskStatus === 'loading';

  return (
    <ThemedView className="flex-1 bg-background">
      <ThemedView className="flex-row items-center justify-between p-4 pb-2">
        <ThemedText type="title" className="font-poppinsBold">
          My Tasks
        </ThemedText>
        <Button
          label=""
          size="default"
          variant="ghost"
          onPress={() => {
            setEditingTask(null); // Ensure no task is being edited when opening for new
            setNewTaskTitle(''); // Clear previous new task title
            setIsModalOpen(true);
          }}>
          <PlusCircle size={24} className="text-foreground" />
        </Button>
      </ThemedView>

      {taskError && (
        <ThemedText className="text-red-500 text-center mb-4">{taskError}</ThemedText>
      )}

      {isLoading && tasks.length === 0 ? ( // Show loader only if no tasks are loaded yet
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <ThemedText className="mt-4 text-muted-foreground">Loading tasks...</ThemedText>
        </ThemedView>
      ) : tasks.length === 0 ? (
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText className="text-muted-foreground">No tasks yet. Add one!</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleComplete={() => handleToggleTaskCompleted(item)}
              onEdit={() => handleEditTask(item)}
              onDelete={() => handleDeleteTask(item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}

      {/* Modal for Add/Edit Task */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px] rounded-lg p-6 dark:bg-gray-900">
          <ThemedView>
            <ThemedText className="text-lg font-semibold leading-none tracking-tight">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </ThemedText>
            <ThemedText className="text-sm text-muted-foreground">
              {editingTask ? 'Make changes to your task here.' : 'Add a new task to your list.'}
            </ThemedText>
          </ThemedView>
          <ThemedView className="py-4">
            <ThemedView className="mb-4">
              <ThemedText className="text-right text-sm font-medium text-foreground">
                Title
              </ThemedText>
              <Input
                id="taskTitle"
                className="mt-2"
                placeholder="e.g., Buy groceries"
                value={editingTask ? editingTask.title : newTaskTitle}
                onChangeText={(text) =>
                  editingTask
                    ? setEditingTask((prev) => (prev ? { ...prev, title: text } : null))
                    : setNewTaskTitle(text)
                }
              />
            </ThemedView>
            {/* You can add more fields here for description, priority, due date etc. */}
            {/* Example for description: */}
            {/* <ThemedView className="mb-4">
              <ThemedText className="text-right text-sm font-medium text-foreground">
                Description (Optional)
              </ThemedText>
              <Input
                id="taskDescription"
                className="mt-2 h-20"
                placeholder="Details about the task"
                value={editingTask?.description || ''}
                onChangeText={(text) =>
                  setEditingTask((prev) => (prev ? { ...prev, description: text } : null))
                }
                multiline
                numberOfLines={3}
              />
            </ThemedView> */}
          </ThemedView>
          {/* DialogFooter */}
          <ThemedView className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button label="Cancel" variant="destructive" onPress={handleCancelEdit} />
            <Button
              label={editingTask ? 'Save Changes' : 'Add Task'}
              onPress={editingTask ? handleSaveEditedTask : handleAddTask}
            />
          </ThemedView>
        </DialogContent>
      </Dialog>
    </ThemedView>
  );
}