// store/slices/networkSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isOnline: boolean;
  isLoading: boolean; // General loading indicator for network requests
  error: string | null; // General error message for network requests
}

const initialState: NetworkState = {
  isOnline: navigator.onLine, // Initialize with current online status
  isLoading: false,
  error: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearNetworkState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setOnlineStatus, setLoading, setError, clearNetworkState } = networkSlice.actions;
export default networkSlice.reducer;