// Example: store/slices/projectSlice.ts (Anticipated Content)
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// Import your Firebase project services here
// import { createProjectInFirestore, getProjectsFromFirestore, updateProjectInFirestore, deleteProjectFromFirestore } from './../../firebaseServices/projectServices';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  userId: string; // The owner of the project
}

interface ProjectState {
  projects: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  status: 'idle',
  error: null,
};

// Async Thunks for Firebase Project Operations
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (userId: string, { rejectWithValue }) => {
    try {
      // return await getProjectsFromFirestore(userId);
      // Placeholder: Replace with actual Firebase service call
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProjectAsync = createAsyncThunk(
  'projects/addProject',
  async ({ project, userId }: { project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId: string }, { rejectWithValue }) => {
    try {
      const newProjectData: Omit<Project, 'id' | 'updatedAt'> = {
        ...project,
        userId: userId,
        createdAt: new Date().toISOString(),
      };
      // return await createProjectInFirestore(newProjectData);
      // Placeholder: Replace with actual Firebase service call
      return { id: 'new-id-' + Date.now(), ...newProjectData } as Project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async (project: Project, { rejectWithValue }) => {
    try {
      // return await updateProjectInFirestore(project);
      // Placeholder: Replace with actual Firebase service call
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // await deleteProjectFromFirestore(projectId);
      // Placeholder: Replace with actual Firebase service call
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // You might still have some synchronous reducers if needed for specific non-persisted state updates
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch projects';
      })
      // Add Project
      .addCase(addProjectAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addProjectAsync.fulfilled, (state, action: PayloadAction<Project>) => {
        state.status = 'succeeded';
        state.projects.unshift(action.payload); // Add to the beginning
      })
      .addCase(addProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to add project';
      })
      // Update Project
      .addCase(updateProjectAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProjectAsync.fulfilled, (state, action: PayloadAction<Project>) => {
        state.status = 'succeeded';
        const index = state.projects.findIndex(proj => proj.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to update project';
      })
      // Delete Project
      .addCase(deleteProjectAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.projects = state.projects.filter(proj => proj.id !== action.payload);
      })
      .addCase(deleteProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to delete project';
      });
  },
});

export default projectSlice.reducer;

// If you still have synchronous actions you want to export, do it here
// export const { /* your synchronous actions */ } = projectSlice.actions;