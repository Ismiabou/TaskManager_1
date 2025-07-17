// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import { setOnlineStatus } from '../store/slices/networkSlices'; // Import setOnlineStatus

import { Home, ListTodo, Settings, CheckSquare } from 'lucide-react-native'; // Icônes
import { Tabs } from 'expo-router'; // Pour TabLayout
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

// Empêche l'écran de démarrage de se masquer automatiquement avant le chargement des ressources.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
   const [firebaseAuthChecked, setFirebaseAuthChecked] = useState(false); 
  const colorScheme = useColorScheme();
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authStatus = useSelector((state: RootState) => state.auth.loading); // 'idle', 'loading', 'succeeded', 'failed'
  const isOnline = useSelector((state: RootState) => state.network.isOnline); // Get network status
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
 useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid || null,
            email: user.email || null,
            role: 'team_member', // Default role
            projectRoles: {}, // Default empty
            displayName: user.displayName || null,
            isAuthenticated: true,
            loading: false, // Ensure loading is set to false here
            error: null,
          })
        );
      } else {
        dispatch(clearAuth()); // This sets isAuthenticated to false and loading to false
      }
      setFirebaseAuthChecked(true); // <--- Set this to true after auth state is determined
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Network Connectivity Checker
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setOnlineStatus(state.isConnected || false));
    });

    NetInfo.fetch().then((state) => {
      dispatch(setOnlineStatus(state.isConnected || false));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // Logique de redirection basée sur l'état Redux et l'état de vérification Firebase
  useEffect(() => {
    // Only attempt redirection after fonts are loaded AND Firebase auth state has been checked
    if (!fontsLoaded || !firebaseAuthChecked) { // <--- Changed condition
      return;
    }

    const inAuthGroup = segments[0] === '(auth)'; // <--- Make sure this matches your folder name

    // Only attempt navigation if online
    if (isOnline) {
      if (!isAuthenticated && inAuthGroup) {
        // We are in an auth route but should be authenticated, no change needed (already there)
        // Or if inAuthGroup is false and !isAuthenticated, then redirect to login.
        // This condition implies we're on a non-auth route but not authenticated, so redirect.
        // Or if isAuthenticated, and we are not in the auth group, no action.
      } else if (!isAuthenticated && !inAuthGroup) { // If not authenticated AND not in auth group
        router.replace('/(auth)/login'); // Redirect to login
      } else if (isAuthenticated && inAuthGroup) { // If authenticated AND in auth group
        router.replace('/(tabs)'); // Redirect to tabs
      }
      // If isAuthenticated && !inAuthGroup: user is logged in and already on a non-auth page (correct) - do nothing
      // If !isAuthenticated && inAuthGroup: user is not logged in and on an auth page (correct) - do nothing
    } else {
      // Handle offline scenario:
      if (!inAuthGroup) {
        console.warn('Offline: Preventing navigation to authenticated routes.');
        // Consider if you want to redirect to an offline-specific page here
        // router.replace('/(offline)');
      }
    }
  }, [isAuthenticated, firebaseAuthChecked, segments, router, isOnline, fontsLoaded]); // <--- Updated dependencies

  // Show splash screen until fonts are loaded AND Firebase auth state is checked
  if (!fontsLoaded || !firebaseAuthChecked) { // <--- Updated condition for rendering
    return null;
  }

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootLayoutContent />
      </Provider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

// Composant séparé pour la mise en page des onglets, à utiliser dans app/(tabs)/_layout.tsx
export function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colorScheme === 'dark' ? '#2563eb' : '#2563eb',
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#6b7280',
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#fff',
            borderTopColor: colorScheme === 'dark' ? '#333' : '#e5e7eb',
            height: 100,
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
    </SafeAreaProvider>
  );
}
