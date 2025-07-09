// app/task-modal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { addTask, addTaskAsync, Task, updateTask } from '../store/slices/taskSlice';

// NEW: Import DateTimePicker
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns'; // For date formatting

// UI Components
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { RadioGroup, RadioGroupItem } from '../components/RadioGroup';
import { Label } from '../components/Label';
import { Dialog, DialogContent } from '../components/Dialog';

// Icons
import { X, ChevronDown, CalendarDays } from 'lucide-react-native'; // Add CalendarDays icon

type Priority = 'Low' | 'Medium' | 'High';

export default function TaskModalScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const params = useLocalSearchParams();
  const taskId = params.taskId as string | undefined;

  const allProjects = useSelector((state: RootState) => state.projects.projects);

  const existingTask = useSelector((state: RootState) =>
    taskId ? state.tasks.tasks.find((t) => t.id === taskId) : undefined
  );
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [dueDate, setDueDate] = useState(existingTask?.dueDate || '');
  const [priority, setPriority] = useState<Priority>(existingTask?.priority || 'Medium');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    existingTask?.projectId
  );
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);

  // NEW: State for Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : new Date()
  );

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setDueDate(existingTask.dueDate || '');
      setPriority(existingTask.priority);
      setSelectedProjectId(existingTask.projectId);
      setSelectedDate(existingTask.dueDate ? new Date(existingTask.dueDate) : new Date()); // Set for date picker
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
      setSelectedProjectId(undefined);
      setSelectedDate(new Date()); // Reset for new task
    }
  }, [existingTask]);

  const handleSaveTask = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Input Required', 'Task title cannot be empty.');
      return;
    }

    const taskData: Task = {
      id: existingTask ? existingTask.id : '',
      title: title.trim(),
      description: description.trim() || undefined,
      completed: existingTask ? existingTask.completed : false,
      priority: priority,
      dueDate: dueDate.trim() || undefined,
      projectId: selectedProjectId,
      createdAt: existingTask ? existingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId ? userId : '',
    };

    if (existingTask) {
      dispatch(updateTask(taskData));
      Alert.alert('Success', 'Task updated successfully!');
    } else {
      dispatch(
        addTaskAsync({
          task: taskData,
          userId: userId ? userId : '',
        })
      );
      Alert.alert('Success', 'Task added successfully!');
    }
    router.back();
  }, [title, description, dueDate, priority, selectedProjectId, existingTask, dispatch, router]);

  const getProjectName = useCallback(
    (projectId?: string) => {
      if (!projectId) return 'No Project';
      const project = allProjects.find((p) => p.id === projectId);
      return project ? project.name : 'Unknown Project';
    },
    [allProjects]
  );

  // NEW: Date Picker handlers
  const onDateChange = useCallback((event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS until "Done"
    if (date) {
      setSelectedDate(date);
      setDueDate(format(date, 'yyyy-MM-dd')); // Format date for storage
    }
  }, []);

  const showDatepicker = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  return (
    <ThemedView className="flex-1 bg-background p-4 pt-12 dark:bg-foreground">
      {/* Custom Header for modal */}
      <ThemedView className="flex-row items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <ThemedText type="title" className="font-poppinsBold text-foreground">
          {existingTask ? 'Edit Task' : 'New Task'}
        </ThemedText>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} className="text-foreground" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView className="mt-4 flex-1">
        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">Title</ThemedText>
          <Input
            placeholder="e.g., Buy groceries"
            value={title}
            onChangeText={setTitle}
            className="text-foreground"
          />
        </ThemedView>

        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">Description</ThemedText>
          <Input
            placeholder="Optional details about the task"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="h-24 text-foreground"
          />
        </ThemedView>

        {/* NEW: Due Date with Date Picker */}
        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">Due Date</ThemedText>
          <TouchableOpacity
            onPress={showDatepicker}
            className="flex-row items-center justify-between rounded-md border border-border bg-input p-3">
            <ThemedText className="text-foreground">{dueDate || 'Select a date'}</ThemedText>
            <CalendarDays size={20} className="text-muted-foreground" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' for iOS for compact view
              onChange={onDateChange}
              minimumDate={new Date()} // Optional: Prevent selecting past dates
            />
          )}
        </ThemedView>

        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">Priority</ThemedText>
          <RadioGroup
            value={priority}
            onValueChange={(value) => setPriority(value as Priority)}
            className="mt-2 flex-row justify-around">
            <ThemedView className="flex-row items-center space-x-2">
              <RadioGroupItem value="Low" id="p_low" />
              <Label nativeID="p_low" className="text-foreground">
                Low
              </Label>
            </ThemedView>
            <ThemedView className="flex-row items-center space-x-2">
              <RadioGroupItem value="Medium" id="p_medium" />
              <Label nativeID="p_medium" className="text-foreground">
                Medium
              </Label>
            </ThemedView>
            <ThemedView className="flex-row items-center space-x-2">
              <RadioGroupItem value="High" id="p_high" />
              <Label nativeID="p_high" className="text-foreground">
                High
              </Label>
            </ThemedView>
          </RadioGroup>
        </ThemedView>

        {/* Project Selection Field */}
        <ThemedView className="mb-4">
          <ThemedText className="mb-1 text-sm font-medium text-foreground">Project</ThemedText>
          <Dialog open={isProjectPickerOpen} onOpenChange={setIsProjectPickerOpen}>
            <TouchableOpacity
              onPress={() => setIsProjectPickerOpen(true)}
              className="flex-row items-center justify-between rounded-md border border-border bg-input p-3">
              <ThemedText className="text-foreground">
                {getProjectName(selectedProjectId)}
              </ThemedText>
              <ChevronDown size={20} className="text-muted-foreground" />
            </TouchableOpacity>

            <DialogContent className="max-w-xs p-4">
              <ThemedView className="flex flex-col space-y-1.5 text-center">
                <ThemedText className="text-lg font-semibold leading-none tracking-tight">
                  Select Project
                </ThemedText>
                <ThemedText className="text-sm text-muted-foreground">
                  Choose a project for this task.
                </ThemedText>
              </ThemedView>
              <ScrollView className="my-4 max-h-60">
                <RadioGroup
                  value={selectedProjectId || 'no-project'}
                  onValueChange={(value) => {
                    setSelectedProjectId(value === 'no-project' ? undefined : value);
                    setIsProjectPickerOpen(false);
                  }}>
                  <ThemedView className="flex-row items-center space-x-2 border-b border-gray-100 py-2 dark:border-gray-800">
                    <RadioGroupItem value="no-project" id="proj_none" />
                    <Label nativeID="proj_none" className="text-foreground">
                      No Project
                    </Label>
                  </ThemedView>
                  {allProjects.map((project) => (
                    <ThemedView
                      key={project.id}
                      className="flex-row items-center space-x-2 border-b border-gray-100 py-2 dark:border-gray-800">
                      <RadioGroupItem value={project.id} id={`proj_${project.id}`} />
                      <Label nativeID={`proj_${project.id}`} className="text-foreground">
                        {project.name}
                      </Label>
                    </ThemedView>
                  ))}
                </RadioGroup>
              </ScrollView>
              <Button
                label="Close"
                onPress={() => setIsProjectPickerOpen(false)}
                variant="secondary"
              />
            </DialogContent>
          </Dialog>
        </ThemedView>
      </ScrollView>

      <Button label="Save Task" size="default" onPress={handleSaveTask} className="mt-4 w-full" />
    </ThemedView>
  );
}
