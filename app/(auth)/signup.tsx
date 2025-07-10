// app/index.tsx - Écran d'inscription (Sign Up)
import React, { useState, useCallback, useEffect } from 'react'; // Import useEffect
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Check } from 'lucide-react-native';
import { Checkbox } from '../../components/Checkbox';

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
              className="mb-6 font-poppinsBold text-foreground dark:text-background">
              Create your first task
            </ThemedText>
            <ThemedView className="m-4 flex w-full flex-col items-center justify-center rounded-lg py-8 shadow-lg dark:bg-gray-800">
              <Input
                placeholder="Email"
                className="mb-4 h-12 w-full items-center"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                placeholder="Password"
                className="mb-4 h-12 w-full items-center"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Input
                placeholder="Confirm Password"
                className="mb-6 h-12 w-full items-center"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <Checkbox label="Remember me" className="mb-6">
                <Check size={20} className="items-center text-primary-foreground" />
              </Checkbox>
              <Button
                label={authLoading ? <ActivityIndicator color="#fff" /> : "Sign Up"}
                size={'default'}
                variant="secondary"
                onPress={handleSignUpPress}
                className="mb-4 w-4/5 items-center justify-center font-poppinsSemiBold"
                disabled={authLoading} // Use authLoading from Redux
              />
              {authError && (
                <ThemedText className="text-red-500 mb-4 text-center">
                  {authError}
                </ThemedText>
              )}
              <ThemedText className="mb-2 text-foreground dark:text-foreground">
                Already have an account?
              </ThemedText>
              <Button
                label="Login"
                size={'default'}
                variant="ghost"
                onPress={navigateToSignIn}
                className="w-4/5 items-center justify-center font-poppinsSemiBold"
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaProvider>
  );
};
export default Signup;