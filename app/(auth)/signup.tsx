// app/index.tsx - Écran d'inscription (Sign Up)
import React, { useState, useCallback } from 'react';
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

// Firebase imports
import { auth } from '../../config/firebaseConfig'; // Importez votre instance auth
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importez la fonction d'inscription

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { setAuthLoading, setAuthError, setAuthenticated } from '../../store/slices/authSlice'; // <--- CORRECTION ICI

const Signup = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authError = useSelector((state: RootState) => state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUpPress = useCallback(async () => {
    if (password !== confirmPassword) {
      Alert.alert('Sign Up Failed', 'Passwords do not match.');
      return;
    }

    dispatch(setAuthLoading()); // Mettre le statut d'authentification en "loading"

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user.email);
      router.replace('/(tabs)'); // Rediriger vers l'écran principal après inscription
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      let errorMessage = 'An unexpected error occurred during sign up. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'The email address is already in use by another account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      dispatch(setAuthError(errorMessage)); // Mettre à jour l'état d'erreur Redux
      Alert.alert('Sign Up Failed', errorMessage); // Afficher une alerte à l'utilisateur
    }
  }, [email, password, confirmPassword, dispatch, router]);

  const navigateToSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const isLoading = authStatus === 'loading';

  return (
    <SafeAreaProvider className="flex-1 bg-background dark:bg-foreground">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-background dark:bg-foreground">
        <ThemedView className="flex-1 items-center justify-center bg-background px-8 dark:bg-foreground">
          <ThemedText
            type="title"
            className="mb-4 font-poppinsBold text-foreground dark:text-foreground">
            Welcome to Task Manager
          </ThemedText>
          <ThemedView className="w-full items-center justify-center bg-background dark:bg-foreground">
            <ThemedText
              type="subtitle"
              className="mb-6 font-poppinsBold text-foreground dark:text-foreground">
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
                label={isLoading ? <ActivityIndicator color="#fff" /> : "Sign Up"}
                size={'default'}
                variant="secondary"
                onPress={handleSignUpPress}
                className="mb-4 w-4/5 items-center justify-center font-poppinsSemiBold"
                disabled={isLoading}
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