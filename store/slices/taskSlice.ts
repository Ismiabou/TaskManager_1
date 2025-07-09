// store/slices/taskSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createTaskInFirestore,
  getTasksFromFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore
} from './../../firebaseServices/taskServices'; // Importez vos services Firebase

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string; // ISO string for date
  createdAt: string;
  projectId?: string; // Link to a project
  updatedAt?: string; // Optional, for tracking updates
  userId: string; // Ajouté pour l'utilisateur propriétaire
}

interface TaskState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  status: 'idle',
  error: null,
};

// Async Thunks pour les opérations Firebase sur les tâches
// Charger les tâches
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      const tasks = await getTasksFromFirestore(userId);
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Ajouter une tâche
export const addTaskAsync = createAsyncThunk(
  'tasks/addTask',
  async ({ task, userId }: { task: Omit<Task, 'id' | 'createdAt' | 'userId' | 'updatedAt'>, userId: string }, { rejectWithValue }) => {
    try {
      const newTask = await createTaskInFirestore(task, userId);
      return newTask;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Mettre à jour une tâche
export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async (task: Task, { rejectWithValue }) => {
    try {
      await updateTaskInFirestore(task);
      return task; // Retourne la tâche mise à jour
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Supprimer une tâche
export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await deleteTaskFromFirestore(taskId);
      return taskId; // Retourne l'ID de la tâche supprimée
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Les reducers synchrones comme addTask, toggleTaskCompleted, updateTask, deleteTask peuvent être simplifiés
    // ou remplacés par les actions des thunks asynchrones si vous voulez que toute modification passe par Firebase
    // Pour l'instant, je les laisse pour montrer comment ils peuvent coexister ou être remplacés.
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt'>>) => {
      // Ce reducer ne sera plus utilisé si vous utilisez addTaskAsync
      const newTask: Task = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...action.payload,
        userId: '', // Temporaire, sera remplacé par la version Firebase
      };
      state.tasks.unshift(newTask);
    },
    toggleTaskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    // Ces reducers de status/erreur sont maintenant gérés par extraReducers
    setTasksLoading: (state) => {
      state.status = 'loading';
    },
    setTasksSuccess: (state, action: PayloadAction<Task[]>) => {
      state.status = 'succeeded';
      state.tasks = action.payload;
      state.error = null;
    },
    setTasksFailure: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // addTaskAsync
      .addCase(addTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.status = 'succeeded';
        state.tasks.unshift(action.payload); // Ajouter la nouvelle tâche au début
      })
      .addCase(addTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // updateTaskAsync
      .addCase(updateTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload; // Mettre à jour la tâche
        }
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // deleteTaskAsync
      .addCase(deleteTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.tasks = state.tasks.filter(task => task.id !== action.payload); // Supprimer la tâche
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { addTask, toggleTaskCompleted, updateTask, deleteTask } = taskSlice.actions; // Ces actions peuvent devenir superflues
export default taskSlice.reducer;