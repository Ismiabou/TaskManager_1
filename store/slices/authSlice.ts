// store/slices/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../config/firebaseConfig'; // Assurez-vous que ce chemin est correct

interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName: string | null; // <-- AJOUTÉ: Nom d'affichage de l'utilisateur
    // Ajoutez d'autres propriétés utilisateur si nécessaire (par exemple, photoURL)
  } | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// Async Thunks pour l'authentification Firebase
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: Record<string, string>, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'N/A',
        displayName: firebaseUser.displayName || null, // Capture le displayName à la connexion
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }: Record<string, string>, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'N/A',
        displayName: firebaseUser.displayName || null, // Capture le displayName à l'inscription
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      // Aucune valeur de retour nécessaire pour le succès du déconnexion
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducers pour gérer les changements d'état d'authentification synchrones
    setAuthenticated: (state, action: PayloadAction<{ uid: string; email: string; displayName: string | null } | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setAuthLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
      state.isAuthenticated = false; // L'utilisateur n'est pas authentifié en cas d'erreur
      state.user = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login User
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload; // Le payload contient maintenant displayName
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = (action.payload as string) || 'Login failed';
      state.isAuthenticated = false;
      state.user = null;
    });

    // Register User
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload; // Le payload contient maintenant displayName
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = (action.payload as string) || 'Registration failed';
      state.isAuthenticated = false;
      state.user = null;
    });

    // Logout User
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.status = 'succeeded';
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = (action.payload as string) || 'Logout failed';
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setAuthenticated, setAuthLoading, setAuthError, clearAuth } = authSlice.actions;

export default authSlice.reducer;