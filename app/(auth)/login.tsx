import React, { useState, useEffect } from 'react'; // Import useEffect
import { ActivityIndicator, TouchableOpacity, Alert, View, Text } from 'react-native';
import { ThemedView } from 'components/ThemedView';
import { ThemedText } from 'components/ThemedText';
import { Input } from 'components/Input';
import { router } from 'expo-router';
import { Button } from 'components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, clearError } from '../../store/slices/authSlice'; // Only import signIn and clearError
import { AppDispatch, RootState } from '../../store'; // Import RootState and AppDispatch for typing
import '../../global.css'; // Ensure global styles are applied

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch: AppDispatch = useDispatch();
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const authError = useSelector((state: RootState) => state.auth.error);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Effect to handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated && !authLoading && !authError) {
      router.replace('/(tabs)'); // Redirect to main screen after successful auth
    }
  }, [isAuthenticated, authLoading, authError, router]);

  // Effect to display errors from Redux
  useEffect(() => {
    if (authError) {
      Alert.alert('Authentication Error', authError);
    }
  }, [authError, dispatch]);

  const handleLoginPress = async () => {
    dispatch(clearError()); // Clear any previous error

    const resultAction = await dispatch(signIn({ email, password }));

    if (signIn.rejected.match(resultAction)) {
      // Error handling is managed by authSlice and displayed by useEffect above
      console.error('Login rejected:', resultAction.payload);
    } else if (signIn.fulfilled.match(resultAction)) {
      console.log('Login successful!');

      router.replace('(tabs)'); // Redirect to main screen after successful auth
      // Navigation is handled by the useEffect watching isAuthenticated
    }
  };

  return (
    <ThemedView className="flex-1 items-center justify-center bg-background px-8 dark:bg-foreground">
      <ThemedText className="mb-4 font-poppinsBold text-foreground dark:text-background">
        Login
      </ThemedText>
      <View className="h-8" />
      <ThemedView className="w-full max-w-sm items-center justify-center py-8">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="mb-4 mb-6 w-full items-center justify-center text-foreground"
          placeholderTextColor="hsl(var(--muted-foreground))"
        />
        <View className="h-8" />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mb-6 w-full items-center justify-center text-foreground"
          placeholderTextColor="hsl(var(--muted-foreground))"
        />
        <View className="h-8" />
        <Button
          label={authLoading ? <ActivityIndicator color="#fff" /> : 'Login'}
          onPress={handleLoginPress}
          disabled={authLoading} // Disable button when loading
          className="mb-4 w-full">
          {authLoading && <ActivityIndicator color="hsl(var(--primary-foreground))" />}
        </Button>
        <View className="h-8" />
        <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
          <Text className="text-center font-poppinsBold text-primary">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
