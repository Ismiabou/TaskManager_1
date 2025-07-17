// login.tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, TouchableOpacity, Alert, View, Text } from 'react-native';
import { ThemedView } from 'components/ThemedView';
import { ThemedText } from 'components/ThemedText';
import { Input } from 'components/Input';
import { router, useSegments } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, clearError } from '../../store/slices/authSlice'; //
import { AppDispatch, RootState } from '../../store'; //
import '../../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Checkbox } from 'components/Checkbox';
import { Check } from 'lucide-react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const segments = useSegments(); // Get current segments
  const dispatch: AppDispatch = useDispatch();
  const authLoading = useSelector((state: RootState) => state.auth.loading); //
  const authError = useSelector((state: RootState) => state.auth.error); //
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated); //

  // Effect to handle navigation after successful login
  // This useEffect will be responsible for navigating to /(tabs)
  useEffect(() => {
    // Only navigate if authenticated, not loading, no error, AND we are on a login-related screen
    // The `_layout.tsx` should handle the overall redirection.
    // This part might be redundant if _layout.tsx is doing its job well,
    // but it acts as a fallback for immediate post-login navigation.
    if (isAuthenticated && !authLoading && !authError) {
      // Check if current segment is already in (tabs) to avoid unnecessary replace
      const currentSegment = segments[0];
      if (currentSegment !== '(tabs)') {
        router.replace('/(tabs)'); //
      }
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

    const resultAction = await dispatch(signIn({ email, password })); //

    if (signIn.rejected.match(resultAction)) {
      console.error('Login rejected:', resultAction.payload);
      // Error handling is managed by authSlice and displayed by useEffect above
      // No need to router.back() unless you want to explicitly leave the login page on rejection.
    } else if (signIn.fulfilled.match(resultAction)) {
      router.replace('/(tabs)');
      console.log('Login successful!');

      // **REMOVE THIS LINE**: router.replace("(tabs)"); // Let _layout.tsx handle navigation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-foreground">
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
          <Checkbox label="Remember me" className="mb-6">
            <Check size={20} className="items-center text-primary-foreground" />
          </Checkbox>
          <View className="h-8" />
          <TouchableOpacity
            onPress={handleLoginPress}
            disabled={authLoading} // Disable button when loading
            className="mb-4 w-[80%] justify-center rounded-lg bg-primary p-4 shadow-lg">
            <Text className="w-[60%]  text-center font-poppinsBold text-background dark:text-foreground">
              {authLoading && <ActivityIndicator color="hsl(var(--primary-foreground))" /> ? (
                <ActivityIndicator color="#fff" />
              ) : (
                'Login'
              )}
            </Text>
          </TouchableOpacity>
          <View className="h-8" />
          <TouchableOpacity onPress={() => router.replace('(auth)/signup')}>
            <Text>
              Don't have an account? {''}
              <ThemedText className="text-center font-poppinsBold text-blue-500">
                Sign Up
              </ThemedText>
            </Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
