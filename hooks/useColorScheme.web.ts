import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';


/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  // Charger la préférence stockée au montage
  useEffect(() => {
    AsyncStorage.getItem('colorScheme').then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setColorScheme(stored);
      } else {
        setColorScheme(systemColorScheme ?? 'light');
      }
      setHasHydrated(true);
    });
  }, [systemColorScheme]);

  // Persister la préférence à chaque changement
  useEffect(() => {
    if (colorScheme) {
      AsyncStorage.setItem('colorScheme', colorScheme);
    }
  }, [colorScheme]);

  const setColorSchemeSafe = useCallback((scheme: 'light' | 'dark') => {
    setColorScheme(scheme);
    AsyncStorage.setItem('colorScheme', scheme);
  }, []);

  if (!hasHydrated) {
    return { colorScheme: 'light', setColorScheme: setColorSchemeSafe };
  }

  return { colorScheme: colorScheme ?? 'light', setColorScheme: setColorSchemeSafe };
}
