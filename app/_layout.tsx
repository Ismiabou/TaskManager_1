// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { useColorScheme } from './../hooks/useColorScheme';
import { store } from './../store'; // Importez persistor et store de votre store/index.ts
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'; // Importez SplashScreen

import '../global.css'; // Assurez-vous que vos styles globaux sont importés

// NEW: Import Firebase auth and Redux slices
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setUser, clearAuth } from '../store/slices/authSlice';

import { Home, ListTodo, Settings, CheckSquare } from 'lucide-react-native'; // Icônes
import { Tabs } from 'expo-router'; // Pour TabLayout

// Empêche l'écran de démarrage de se masquer automatiquement avant le chargement des ressources.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authStatus = useSelector((state: RootState) => state.auth.loading); // 'idle', 'loading', 'succeeded', 'failed'
  const router = useRouter();
  const segments = useSegments();

  // 1. Chargement des polices
  const [fontsLoaded, error] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
  });

  // Gérer les erreurs de chargement des polices
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Hide splash screen once fonts are loaded
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid || null, email: user.email || null, role: "team_member", projectRoles: {}, displayName: user.displayName || null, isAuthenticated: true, loading: false, error: null }));
      } else {
        dispatch(clearAuth());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // 3. Logique de redirection basée sur l'état Redux
  useEffect(() => {
    // This check ensures we only redirect after the initial authentication status is determined
    if (authStatus) return;

    const inAuthGroup = segments[0] === 'auth';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, authStatus, segments, router]);

  // Si les polices ne sont pas encore chargées, ne rien rendre (l'écran de démarrage reste visible)
  if (!fontsLoaded) {
    return null;
  }

  // Rendre les navigateurs et les fournisseurs de contexte
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="task-modal" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen
            name="project-details"
            options={{ presentation: 'card', headerShown: false }}
          />
          <Stack.Screen
            name="project-modal"
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// Le composant RootLayout qui fournit le store Redux et la PersistGate
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        {/* REMOVED: PersistGate is no longer needed since local storage is removed */}
        <RootLayoutContent />
      </Provider>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
    </SafeAreaProvider>
  );
}

// Composant séparé pour la mise en page des onglets, à utiliser dans app/(tabs)/_layout.tsx
export function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colorScheme === 'dark' ? '#2563eb' : '#2563eb',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#6b7280',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#fff',
          borderTopColor: colorScheme === 'dark' ? '#333' : '#e5e7eb',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
          fontFamily: 'Poppins-Regular',
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <ListTodo size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: 'Completed',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
