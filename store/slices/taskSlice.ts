// store/slices/tasksSlice.js
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Import deleteDoc
import { db } from '../../config/firebaseConfig';

// Updated Task Interface to match createTask properties
export interface Task {
  id: string;
  projectId: string;
  title: string; // Changed from 'name' to 'title' to match createTask thunk
  description?: string;
  completed: boolean; // Optional description
  status: 'to-do' | 'in-progress' | 'done' | 'blocked'; // Example statuses
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string[]; // Array of user UIDs
  dueDate?: Date; // Optional due date using Firebase Date
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Added to match createTask
  attachments?: string[]; // Added to match createTask
}

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null; // To store the unsubscribe function
}

// Initial state, typed with TasksState
const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  unsubscribe: null,
};

export const listenToTasks = createAsyncThunk<
  () => void, // Return type: unsubscribe function
  string,     // Argument type: projectId
  { rejectValue: string } // ThunkAPI: rejectValue type
>(
  'tasks/listenToTasks',
  async (projectId, { dispatch, rejectWithValue }) => {
    if (!projectId) {
      return rejectWithValue('No project selected for tasks.');
    }

    const q = query(
      collection(db, 'projects', projectId, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]; // Explicitly cast to Task[]
      dispatch(setTasks(tasksData));
    }, (error) => {
      console.error("Error listening to tasks:", error);
      dispatch(setError(error.message));
    });
    return unsubscribe;
  }
);

export const createTask = createAsyncThunk<
  void, // Return type: No specific data returned, state updated via listener
  {
    projectId: string;
    title: string;
    description: string;
    assignedTo: string[];
    dueDate?: string; // Expecting string to convert to Date
    priority: 'low' | 'medium' | 'high';
    createdBy: string;
  },
  { rejectValue: string }
>(
  'tasks/createTask',
  async ({ projectId, title, description, assignedTo, dueDate, priority, createdBy }, { rejectWithValue }) => {
    try {
      const taskData = {
        title,
        description,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null, // Convert string to Date
        status: 'to-do', // Default status for new tasks
        priority,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [], // Default empty array
      };
      await addDoc(collection(db, 'projects', projectId, 'tasks'), taskData);
      return; // Data updated via listener
    } catch (error: any) {
      console.error("Error creating task:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk<
  void, // Return type: No specific data returned, state updated via listener
  { projectId: string; taskId: string; updates: Partial<Task> }, // Partial<Task> allows only some fields to be updated
  { rejectValue: string }
>(
  'tasks/updateTask',
  async ({ projectId, taskId, updates }, { rejectWithValue }) => {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return; // Data updated via listener
    } catch (error: any) {
      console.error("Error updating task:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk<
  void, // Return type: No specific data returned, state updated via listener
  { projectId: string; taskId: string },
  { rejectValue: string }
>(
  'tasks/deleteTask',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await deleteDoc(taskRef);
      return; // Data updated via listener
    } catch (error: any) {
      console.error("Error deleting task:", error);
      return rejectWithValue(error.message);
    }
  }
);


const tasksSlice = createSlice({
  name: 'tasks',
  initialState, // Use the typed initialState
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTasks: (state) => { // When switching projects or logging out
      if (state.unsubscribe) {
        state.unsubscribe();
      }
      state.items = [];
      state.loading = false;
      state.error = null;
      state.unsubscribe = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenToTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(listenToTasks.fulfilled, (state, action) => {
        state.unsubscribe = action.payload;
      })
      .addCase(listenToTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.pending, (state) => { state.loading = true; })
      .addCase(createTask.fulfilled, (state) => { state.loading = false; })
      .addCase(createTask.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateTask.pending, (state) => { state.loading = true; })
      .addCase(updateTask.fulfilled, (state) => { state.loading = false; })
      .addCase(updateTask.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteTask.pending, (state) => { state.loading = true; }) // Add case for deleteTask pending
      .addCase(deleteTask.fulfilled, (state) => { state.loading = false; }) // Add case for deleteTask fulfilled
      .addCase(deleteTask.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; }); // Add case for deleteTask rejected
  },
});

export const { setTasks, setError, clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;