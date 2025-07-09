// store/index.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import taskReducer from './slices/taskSlice';
import projectReducer from './slices/projectSlice';
import authReducer from './slices/authSlice'; // Import your new authReducer

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Add 'auth' to the whitelist to persist authentication state
  whitelist: ['tasks', 'projects', 'auth'], // Whitelist the reducers you want to persist
};

const rootReducer = combineReducers({
  tasks: taskReducer,
  projects: projectReducer,
  auth: authReducer, // Add the authReducer here
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore these actions for serializable check
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;