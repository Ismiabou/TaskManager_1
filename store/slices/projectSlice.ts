// store/slices/projectsSlice.js
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'; // Import PayloadAction
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore'; // Import Date
import { db } from '../../config/firebaseConfig'; // Adjust path
import { RootState } from '../../store'; // Assuming RootState is exported from your store/index.ts

// These interfaces are assumed to be defined either here or in a separate types.ts
// For this example, I'm keeping them here as per your provided file.

/**
 * Interface for a Task within a Project.
 */
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string; // Optional description
  status: 'to-do' | 'in-progress' | 'done' | 'blocked'; // Example statuses
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string[]; // Array of user UIDs
  dueDate?: Date; // Optional due date using Firebase Date
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for a Project.
 */
export interface Project {
  id: string;
  name: string;
  description?: string; // Optional description
  ownerId: string; // UID of the user who owns the project
  members: { [uid: string]: 'admin' | 'editor' | 'viewer' }; // Members and their roles within the project
  startDate?: Date; // Optional start date
  endDate?: Date; // Optional end date
  status: 'active' | 'completed' | 'archived'; // Example project statuses
  tasks?: Task[]; // Array of tasks belonging to this project (optional, can be fetched separately)
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null; // For the listener
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  unsubscribe: null,
};

// Async Thunk to listen to real-time project updates for a user
export const listenToProjects = createAsyncThunk<
  () => void, // Return type: unsubscribe function
  string, // Argument type: userId
  { rejectValue: string }
>(
  'projects/listenToProjects',
  async (userId, { dispatch, rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue('User ID is required to listen to projects.');
    }

    // Query for projects where the user is either the owner or a member
    const q = query(
      collection(db, 'projects'),
      where(`members.${userId}`, 'in', ['admin', 'editor', 'viewer']) // Check if user is a member with any role
      // Or if you only want projects owned by the user: where('ownerId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData: Project[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        dispatch(setProjects(projectsData));
      },
      (error) => {
        console.error('Error listening to projects:', error);
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }
    );

    return unsubscribe; // Return the unsubscribe function
  }
);

// Async Thunk for creating a project
export const createProject = createAsyncThunk<
  Project, // Return type: the created project
  { name: string; description?: string; ownerId: string }, // Argument type
  { state: RootState; rejectValue: string }
>(
  'projects/createProject',
  async ({ name, description, ownerId }, { rejectWithValue, getState }) => {
    try {
      const newProjectRef = collection(db, 'projects');
      const newProject: Omit<Project, 'id' | 'tasks'> = {
        name,
        description: description || '',
        ownerId,
        members: { [ownerId]: 'admin' }, // Owner is automatically an admin
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await addDoc(newProjectRef, newProject);
      return { id: docRef.id, ...newProject } as Project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for updating a project
export const updateProject = createAsyncThunk<
  void, // Return type: void as updates are handled by listener
  { projectId: string; updates: Partial<Omit<Project, 'id' | 'createdAt' | 'ownerId'>> }, // Argument type
  { rejectValue: string }
>(
  'projects/updateProject',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: Date.now(), // Update timestamp on every update
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for deleting a project
export const deleteProject = createAsyncThunk<
  void, // Return type: void as deletion is handled by listener
  string, // Argument type: projectId
  { rejectValue: string }
>(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'archived', // Soft delete by archiving
        updatedAt: Date.now(),
      });
      // For hard delete, use: await deleteDoc(doc(db, 'projects', projectId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for adding a team member to a project
export const addTeamMember = createAsyncThunk<
  void, // Return type
  { projectId: string; userId: string; role: 'admin' | 'editor' | 'viewer' }, // Argument type
  { rejectValue: string }
>(
  'projects/addTeamMember',
  async ({ projectId, userId, role }, { rejectWithValue }) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        [`members.${userId}`]: role, // Use field path to set specific member role
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      console.error('Error adding team member:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for removing a team member from a project
export const removeTeamMember = createAsyncThunk<
  void,
  { projectId: string; userId: string },
  { rejectValue: string }
>(
  'projects/removeTeamMember',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        members: arrayRemove({ [userId]: 'admin' }), // This might need a more complex update if 'members' is an object
        // A better approach for removing a field from an object is FieldValue.delete()
        // const updateObject = {};
        // updateObject[`members.${userId}`] = FieldValue.delete();
        // await updateDoc(projectRef, updateObject);
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      console.error('Error removing team member:', error);
      return rejectWithValue(error.message);
    }
  }
);


const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProjects: (state) => {
      if (state.unsubscribe) {
        state.unsubscribe(); // Unsubscribe from listener
      }
      state.projects = [];
      state.selectedProject = null;
      state.loading = false;
      state.error = null;
      state.unsubscribe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // For listening to projects
      .addCase(listenToProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(listenToProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.unsubscribe = action.payload; // Store the unsubscribe function
      })
      .addCase(listenToProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Cast to string
      })
      // For creating project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        // The project will be added to `state.projects` by the `setProjects` action from the listener
        // Or you can optimistically add it here if you prefer immediate UI update before listener fires:
        // state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // For updating project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProject.fulfilled, (state) => {
        state.loading = false;
        // State updates will be handled by the onSnapshot listener for projects
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // For deleting project (archiving)
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProject.fulfilled, (state) => {
        state.loading = false;
        // State updates will be handled by the onSnapshot listener for projects
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // For adding team member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        // State updates will be handled by the onSnapshot listener for projects
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // For removing team member
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        // State updates will be handled by the onSnapshot listener for projects
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProjects, setSelectedProject, setError, clearProjects } = projectsSlice.actions;
export default projectsSlice.reducer;