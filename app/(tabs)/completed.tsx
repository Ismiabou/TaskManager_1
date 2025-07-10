// app/(tabs)/completed.tsx
import React, { useCallback, useMemo } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Alert, ActivityIndicator } from 'react-native'; // Import Alert
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store'; // Import AppDispatch
import TaskItem from '../../components/TaskItem'; // Assuming you'll use TaskItem here too
import { updateTask, deleteTask, listenToTasks, Task } from '../../store/slices/taskSlice'; // Import necessary thunks and Task interface
import { useEffect } from 'react'; // Import useEffect

export default function CompletedTasksScreen() {
  const dispatch: AppDispatch = useDispatch(); // Explicitly type dispatch with AppDispatch

  const allTasks = useSelector((state: RootState) => state.tasks.items); // Corrected to state.tasks.items
  const tasksLoading = useSelector((state: RootState) => state.tasks.loading); // Get loading state
  const tasksError = useSelector((state: RootState) => state.tasks.error); // Get error state

  // Assuming you have a way to get the currently selected project ID
  const selectedProject = useSelector((state: RootState) => state.projects.selectedProject);
  const projectId = selectedProject?.id;

  // Listen to tasks for the selected project
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (projectId) {
      dispatch(listenToTasks(projectId)).then((action) => {
        if (listenToTasks.fulfilled.match(action)) {
          unsubscribe = action.payload; // Store the unsubscribe function
        }
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe when component unmounts or projectId changes
      }
    };
  }, [dispatch, projectId]);

  const tasks = useMemo(
    () => allTasks.filter((task) => task.status === 'done'), // Filter by status 'done'
    [allTasks]
  );

  const handleToggleCompleted = useCallback(
    (taskToToggle: Task) => { // Accept the full task object
      if (!projectId) {
        Alert.alert('Error', 'No project selected.');
        return;
      }

      // Determine the new status based on the current status
      const newStatus = taskToToggle.status === 'done' ? 'to-do' : 'done'; // Toggle between 'done' and 'to-do'

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
    (taskId: string) => {
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
            dispatch(deleteTask({ projectId: projectId, taskId: taskId }));
          },
        },
      ]);
    },
    [dispatch, projectId]
  );

  const handleEditTask = useCallback((task: Task) => {
    // For completed tasks, you might want a view-only dialog or ability to re-open
    Alert.alert('View Task', `Title: ${task.title}\nStatus: ${task.status}`);
    // Example to re-open a task from 'done' to 'in-progress'
    // if (task.status === 'done') {
    //   dispatch(updateTask({ projectId: projectId, taskId: task.id, updates: { status: 'in-progress' } }));
    // }
  }, []);

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        onToggleComplete={() => handleToggleCompleted(item)} // Pass the full item
        onEdit={() => handleEditTask(item)} // Pass the full item
        onDelete={() => handleDeleteTask(item.id)}
      />
    ),
    [handleToggleCompleted, handleEditTask, handleDeleteTask]
  );

  // Display error if any
  useEffect(() => {
    if (tasksError) {
      Alert.alert('Task Error', tasksError);
    }
  }, [tasksError]);


  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-foreground">
      <ThemedView className="flex-row items-center justify-between border-b border-gray-200 bg-background p-4 dark:border-gray-700 dark:bg-foreground">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          Completed Tasks
        </ThemedText>
      </ThemedView>

      {tasksLoading && tasks.length === 0 ? ( // Show loading indicator only if no tasks loaded yet
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <ThemedText className="mt-4 text-muted-foreground">Loading completed tasks...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <ThemedView className="mt-20 flex-1 items-center justify-center">
              <ThemedText className="text-lg text-muted-foreground">
                No completed tasks yet!
              </ThemedText>
            </ThemedView>
          }
        />
      )}
    </SafeAreaView>
  );
}