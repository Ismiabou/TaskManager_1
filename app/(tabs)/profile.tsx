// app/(tabs)/profile.tsx
import { ThemedText } from './../../components/ThemedText';
import { ThemedView } from './../../components/ThemedView';
import { Button } from '../../components/Button'; // Import your custom Button component
import { router } from 'expo-router';
import React, { useCallback } from 'react'; // Import useCallback
import { Button as RNButton } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice'; // Import logoutUser thunk

export default function ProfileScreen() {
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authStatus = useSelector((state: RootState) => state.auth.status); // To show loading state

  const handleLogout = useCallback(async () => {
    // Dispatch Firebase logout thunk
    await dispatch(logoutUser());
    // The _layout.tsx hook will handle navigation away from protected routes if logout is successful
  }, [dispatch]);

  return (
    <ThemedView className="flex-1 items-center justify-center bg-background p-4">
      <ThemedText className="mb-4 text-2xl font-bold text-foreground">
        Profile & Settings
      </ThemedText>

      {isAuthenticated ? (
        <ThemedView className="items-center">
          <ThemedText className="mb-2 text-lg text-foreground">
            Welcome, {user?.email || 'User'}!
          </ThemedText>
          {/* Add more profile details here later */}
          <RNButton
            title={authStatus === 'loading' ? 'Logging out...' : 'Logout'}
            onPress={handleLogout}
            disabled={authStatus === 'loading'}
          />
          <Button
            label="Modifier le profil"
            size={'default'}
            variant="ghost"
            onPress={() => router.push('/(modals)/edit-profile')}
            className="mt-2 w-4/5 items-center justify-center font-poppinsSemiBold"
          />
        </ThemedView>
      ) : (
        <ThemedView className="items-center">
          <ThemedText className="mb-4 text-muted-foreground">You are not logged in.</ThemedText>
          <RNButton title="Go to Login" onPress={() => router.push('/auth/login')} />
        </ThemedView>
      )}
    </ThemedView>
  );
}
