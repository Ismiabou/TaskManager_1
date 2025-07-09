// app/auth/login.tsx
import React, { useState, useCallback } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { loginUser } from '../../store/slices/authSlice'; // Import the login thunk

import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button'; // Assuming you have a Button component

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authError = useSelector((state: RootState) => state.auth.error);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Input Required', 'Please enter both email and password.');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.rejected.match(result)) {
      Alert.alert('Login Failed', authError || 'An unknown error occurred.');
    }
    // No need to navigate here, the _layout.tsx hook handles redirection on successful login
  }, [email, password, dispatch, authError]);

  return (
    <ThemedView className="flex-1 items-center justify-center bg-background p-6">
      <ThemedText className="text-3xl font-bold text-foreground mb-8">Login</ThemedText>

      <ThemedView className="w-full max-w-sm">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="mb-4 text-foreground"
          placeholderTextColor="hsl(var(--muted-foreground))"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mb-6 text-foreground"
          placeholderTextColor="hsl(var(--muted-foreground))"
        />
        <Button
          label="Login"
          onPress={handleLogin}
          disabled={authStatus === 'loading'}
          className="w-full mb-4"
        >
          {authStatus === 'loading' && (
            <ActivityIndicator color="hsl(var(--primary-foreground))" />
          )}
        </Button>
        <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
          <ThemedText className="text-center text-primary text-base">
            Don't have an account? Sign Up
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}