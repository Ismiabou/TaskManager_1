// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import '../../global.css'; // Assurez-vous d'importer vos styles globaux

export default function ModalLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // Cache l'en-tête par défaut pour tous les écrans dans ce groupe
          presentation: 'modal', // Force tous les écrans de ce groupe à être présentés comme des modaux
        }}
      >
      </Stack>
    </ThemeProvider>
  );
}