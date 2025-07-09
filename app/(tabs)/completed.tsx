// app/(tabs)/completed.tsx
import React, { useCallback, useMemo } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import TaskItem from '../../components/TaskItem'; // Assuming you'll use TaskItem here too
import { toggleTaskCompleted, deleteTask, updateTask } from '../../store/slices/taskSlice';
import { Alert } from 'react-native';
import { Task } from '../../store/slices/taskSlice';

export default function CompletedTasksScreen() {
  const dispatch = useDispatch();
  const allTasks = useSelector((state: RootState) => state.tasks.tasks);

  const tasks = useMemo(() => allTasks.filter((task) => task.completed), [allTasks]);

  const handleToggleCompleted = useCallback(
    (id: string) => {
      dispatch(toggleTaskCompleted(id));
    },
    [dispatch]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask(id));
          },
        },
      ]);
    },
    [dispatch]
  );

  // For completed tasks, maybe you don't need an edit button, or it behaves differently
  const handleEditTask = useCallback((task: Task) => {
    // Maybe show a view-only dialog or navigate to a details screen
    Alert.alert('View Task', `Task: ${task.title}\nCompleted: ${task.completed ? 'Yes' : 'No'}`);
  }, []);

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        onToggleComplete={handleToggleCompleted}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    ),
    [handleToggleCompleted, handleEditTask, handleDeleteTask]
  );

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-foreground">
      <ThemedView className="flex-row items-center justify-between border-b border-gray-200 bg-background p-4 dark:border-gray-700 dark:bg-foreground">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          Completed Tasks
        </ThemedText>
      </ThemedView>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <ThemedView className="mt-20 flex-1 items-center justify-center">
            <ThemedText className="text-lg text-muted-foreground">
              No completed tasks yet.
            </ThemedText>
          </ThemedView>
        }
      />
    </SafeAreaView>
  );
}
