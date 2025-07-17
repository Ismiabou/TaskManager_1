// app/index.tsx - Écran d'inscription (Sign Up)
import React, { useState, useCallback, useEffect } from 'react'; // Import useEffect
import { ScrollView, Alert, ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../components/Input';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

import '../../global.css'; // Assurez-vous que vos styles globaux sont importés

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { signUp, clearError } from '../../store/slices/authSlice'; // Importez le thunk signUp et clearError

const Signup = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  // We'll use 'loading' for authStatus as per our authSlice.js
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const authError = useSelector((state: RootState) => state.auth.error);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated); // To check if signup successfully logged in

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Effect to handle navigation after successful signup/login by auth listener
  useEffect(() => {
    if (isAuthenticated && !authLoading && !authError) {
      router.replace('/(tabs)'); // Redirect to main screen after successful auth
    }
  }, [isAuthenticated, authLoading, authError, router]);

  // Effect to display errors from Redux
  useEffect(() => {
    if (authError) {
      Alert.alert('Sign Up Failed', authError);
      // Optionally clear the error after displaying
      // dispatch(clearError());
    }
  }, [authError, dispatch]); // Added dispatch to dependencies as it's used within useEffect

  const handleSignUpPress = useCallback(async () => {
    // Clear any previous error from Redux state
    dispatch(clearError());

    if (password !== confirmPassword) {
      Alert.alert('Sign Up Failed', 'Passwords do not match.');
      return;
    }

    try {
      // Dispatch the Redux signUp thunk
      const resultAction = await dispatch(signUp({ email, password }));

      if (signUp.rejected.match(resultAction)) {
        // Error handling is managed by the authSlice and displayed by the useEffect above
        console.error('Sign up rejected:', resultAction.payload);
      } else if (signUp.fulfilled.match(resultAction)) {
        // Signup successful. The actual authentication state change (isAuthenticated = true)
        // will be handled by the onAuthStateChanged listener in initializeAuthListener
        // which then triggers navigation via the useEffect at the top of this component.
        console.log('User signed up successfully. Authentication state will update.');
        // No explicit router.replace here, it's handled by the useEffect above
      }
    } catch (error) {
      // This catch block is mostly for unexpected errors not caught by the thunk's rejectWithValue
      console.error('Unexpected error during sign up dispatch:', error);
      Alert.alert('Error', 'An unexpected client error occurred.');
    }
  }, [email, password, confirmPassword, dispatch, isAuthenticated, authLoading, authError, router]); // Added missing dependencies

  const navigateToSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  return (
    <SafeAreaProvider className="flex-1 bg-background dark:bg-foreground">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-background dark:bg-foreground">
        <ThemedView className="flex-1 items-center justify-center bg-background px-8 dark:bg-foreground">
          <ThemedText
            type="title"
            className="mb-4 font-poppinsBold text-foreground dark:text-background">
            Welcome to Task Manager
          </ThemedText>
          <ThemedView className="w-full items-center justify-center bg-background dark:bg-foreground">
            <ThemedText
              type="subtitle"
              className="mb-6 justify-center text-center font-poppinsBold text-foreground dark:text-background">
              Create your first task and manage your projects efficiently !
            </ThemedText>
            <ThemedView className="w-full max-w-sm items-center justify-center py-8">
              <View className="h-8" />
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
              <Input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                className="mb-6 w-full items-center justify-center text-foreground"
                placeholderTextColor="hsl(var(--muted-foreground))"
              />
              <View className="h-8" />
              <TouchableOpacity
                onPress={handleSignUpPress}
                disabled={authLoading}
                className="mb-4 w-[80%] justify-center rounded-lg bg-primary p-4 shadow-lg">
                <Text className="w-[60%]  text-center font-poppinsBold text-background dark:text-foreground">
                  {authLoading && <ActivityIndicator color="hsl(var(--primary-foreground))" /> ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    'Sign Up'
                  )}
                </Text>
              </TouchableOpacity>
              <View className="h-8" />
              <TouchableOpacity onPress={() => router.replace('(auth)/login')}>
                <Text>
                  Don't have an account? {''}
                  <ThemedText className="text-center font-poppinsBold text-blue-500">
                    Sign Up
                  </ThemedText>
                </Text>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaProvider>
  );
};
export default Signup;
