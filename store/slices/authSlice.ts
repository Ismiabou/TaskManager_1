// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'; // Import PayloadAction
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig'; // Adjust path

// 1. Define the User Interface
export interface User {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  role: 'team_member' | 'admin' | null; // Example roles
  projectRoles: { [projectId: string]: string }; // Example: { 'projectId1': 'viewer', 'projectId2': 'editor' }
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 2. Define the initial state with the User interface
const initialState: User = {
  uid: null,
  email: null,
  displayName: null,
  role: null,
  projectRoles: {},
  isAuthenticated: false,
  loading: true, // Initially true while checking auth state
  error: null,
};

// Async Thunk for Sign Up
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.email?.split('@')[0] || 'New User', // Basic display name, handle null email
        role: 'team_member', // Default role for new sign-ups
        projectRoles: {},
        createdAt: new Date(),
      });

      return { uid: user.uid, email: user.email };
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for Sign In
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return { uid: user.uid, email: user.email };
    } catch (error: any) {
      console.error('Sign In Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for Sign Out
export const signOutUser = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    await signOut(auth);
    // Clean up projects/tasks data in Redux on logout if necessary
    // dispatch(clearProjects());
    // dispatch(clearTasks());
    return true;
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    return rejectWithValue(error.message);
  }
});

// Async Thunk to listen for auth state changes and fetch user profile
export const initializeAuthListener = createAsyncThunk(
  'auth/initializeAuthListener',
  async (_, { dispatch }) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch their Firestore profile
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              dispatch(
                setUser({
                  uid: user.uid,
                  email: user.email,
                  displayName: userData.displayName || user.email?.split('@')[0] || 'User',
                  role: userData.role || 'team_member',
                  projectRoles: userData.projectRoles || {},
                  isAuthenticated: true,
                  loading: false,
                  error: null,
                })
              );
            } else {
              // User profile document not found, this shouldn't happen after signup
              // but handle gracefully, maybe log out or set a default
              console.warn('User profile not found in Firestore for authenticated user:', user.uid);
              dispatch(
                setUser({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.email?.split('@')[0] || 'User', // Fallback
                  role: 'team_member', // Default if profile missing
                  projectRoles: {},
                  isAuthenticated: true,
                  loading: false,
                  error: 'User profile document missing.',
                })
              );
            }
          },
          (error) => {
            console.error('Error fetching user profile:', error);
            dispatch(
              setUser({
                // Set isAuthenticated to false on profile fetch error
                uid: null,
                email: null,
                displayName: null,
                role: null,
                projectRoles: {},
                isAuthenticated: false,
                loading: false,
                error: error.message,
              })
            );
          }
        );
      } else {
        // User is signed out
        dispatch(
          setUser({
            uid: null,
            email: null,
            displayName: null,
            role: null,
            projectRoles: {},
            isAuthenticated: false,
            loading: false,
            error: null,
          })
        );
      }
    });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState, // Use the typed initialState
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      if (action.payload) {
        state.uid = action.payload.uid;
        state.email = action.payload.email;
        state.displayName = action.payload.displayName;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.loading = action.payload.loading;
        state.error = action.payload.error;
      } else {
        // If payload is null (user is logged out or no user)
        state.uid = null;
        state.email = null;
        state.displayName = null;
        state.isAuthenticated = false; // Set isAuthenticated to false
        state.loading = false;
        state.error = null;
      }
    },
    clearAuth: (state) => {
      Object.assign(state, initialState); // Reset state to initial unauthenticated values
      state.loading = false; // Ensure loading is false after clearing auth
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle signIn
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        // Authentication listener will eventually update the full user state
        // This case primarily indicates the login attempt itself was successful
        state.loading = false;
        state.error = null;
        // Optionally, if you want to use the payload from signIn immediately:
        // if (action.payload) {
        //   state.uid = action.payload.uid;
        //   state.email = action.payload.email;
        //   state.isAuthenticated = true; // Set directly here if preferred, but listener will confirm
        // }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false; // Ensure this is false on rejection
      })
      // Handle signUp
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        // User created, authentication listener will eventually update user state
        state.loading = false;
        state.error = null;
        // Optionally, if you want to use the payload from signUp immediately:
        // if (action.payload) {
        //   state.uid = action.payload.uid;
        //   state.email = action.payload.email;
        //   state.isAuthenticated = true; // Set directly here if preferred, but listener will confirm
        // }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle signOut
      .addCase(signOutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        // State cleared by setUser action dispatched by onAuthStateChanged listener
        // Or you can directly reset to initial state here if signOutUser is the only path to logout
        // Object.assign(state, initialState);
        state.loading = false;
        state.error = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle initializeAuthListener lifecycle
      .addCase(initializeAuthListener.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuthListener.fulfilled, (state) => {
        // The actual user data is set by the `onSnapshot` dispatching `setUser`
        state.loading = false; // Listener established
      })
      .addCase(initializeAuthListener.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.error.message as string) || 'Failed to initialize auth listener';
      });
  },
});

export const { setUser, clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
