// store/index.ts (or index.js, but .ts is preferred for TypeScript)

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectSlice';
import tasksReducer from './slices/taskSlice'; // Import your tasks slice
import networkReducer from './slices/networkSlices'; // Import your network slice
// Add other reducers as you create them

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer, // Add your tasks slice here
    network: networkReducer, // Add your network slice here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for Firebase Timestamps if you store them directly in Redux
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, projects: ProjectsState, ...}
export type AppDispatch = typeof store.dispatch;