// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Pour Redux Persist

import { useColorScheme } from './../hooks/useColorScheme';
import { persistor, store } from './../store'; // Importez persistor et store de votre store/index.ts
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'; // Importez SplashScreen

import '../global.css'; // Assurez-vous que vos styles globaux sont importés

// NEW: Import Firebase auth and Redux slices
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setAuthenticated, clearAuth } from '../store/slices/authSlice';

import { Home, ListTodo, User, Folder, Settings, CheckSquare } from 'lucide-react-native'; // Icônes
import { Tabs } from 'expo-router'; // Pour TabLayout

// Empêche l'écran de démarrage de se masquer automatiquement avant le chargement des ressources.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const  colorScheme = useColorScheme();
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authStatus = useSelector((state: RootState) => state.auth.status); // 'idle', 'loading', 'succeeded', 'failed'
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

  // 2. Écouteur d'authentification Firebase et masquage de l'écran de démarrage
  useEffect(() => {
    // Exécuter cet effet uniquement si les polices sont chargées
    if (fontsLoaded) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          dispatch(setAuthenticated({ uid: firebaseUser.uid, email: firebaseUser.email || 'N/A', displayName: firebaseUser.displayName || null }));
        } else {
          dispatch(clearAuth());
        }
        // Une fois que Firebase a vérifié l'état d'authentification, masquez l'écran de démarrage
        SplashScreen.hideAsync();
      });
      return () => unsubscribe();
    }
  }, [fontsLoaded, dispatch]);

  // 3. Logique de redirection basée sur l'état Redux
  useEffect(() => {
    // Effectuer la redirection uniquement après le chargement des polices et la détermination de l'état d'authentification (pas 'loading')
    // Et seulement si l'état d'authentification n'est pas "loading" pour éviter les redirections prématurées
    if (fontsLoaded && authStatus !== 'loading') {
      const inAuthGroup = segments[0] === '(auth)'; // Détecte si l'utilisateur est sur un écran d'authentification

      if (isAuthenticated && inAuthGroup) {
        // L'utilisateur est authentifié et sur un écran d'authentification, rediriger vers l'application principale
        router.replace('/'); // Redirige vers la racine (généralement vos onglets)
      } else if (!isAuthenticated && !inAuthGroup) {
        // L'utilisateur n'est pas authentifié et n'est pas sur un écran d'authentification, rediriger vers la connexion
        router.replace('/(auth)/signup');
      }
    }
  }, [isAuthenticated, authStatus, fontsLoaded, segments, router]);

  // Si les polices ne sont pas encore chargées, ne rien rendre (l'écran de démarrage reste visible)
  if (!fontsLoaded) {
    return null;
  }

  // Rendre les navigateurs et les fournisseurs de contexte
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme }>
      <SafeAreaProvider>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
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
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// Le composant RootLayout qui fournit le store Redux et la PersistGate
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutContent />
      </PersistGate>
    </Provider>
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
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
