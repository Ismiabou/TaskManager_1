// app/(tabs)/edit-profile.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

import '../../global.css';

// Firebase imports
import { auth } from '../../config/firebaseConfig';
import { updateProfile } from 'firebase/auth';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { setAuthenticated, setAuthLoading, setAuthError } from '../../store/slices/authSlice';

const EditProfileScreen = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const authStatus = useSelector((state: RootState) => state.auth.status);

  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour le displayName localement si l'utilisateur Firebase change
  useEffect(() => {
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
    }
  }, [auth.currentUser?.displayName]);


  const handleUpdateProfile = useCallback(async () => {
    if (!auth.currentUser) {
      Alert.alert('Erreur', 'Aucun utilisateur connecté.');
      return;
    }

    setIsLoading(true);
    dispatch(setAuthLoading()); // Mettre le statut Redux en chargement

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        // photoURL: "https://example.com/jane-q-user/profile.jpg" // Ajoutez si vous gérez les photos de profil
      });

      // Mettre à jour l'état Redux avec les nouvelles informations de l'utilisateur
      dispatch(setAuthenticated({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || 'N/A',
        displayName: auth.currentUser.displayName || null,
      }));

      Alert.alert('Succès', 'Votre profil a été mis à jour.');
      router.back(); // Retourner à l'écran précédent (Profil ou Paramètres)
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil :', error.message);
      dispatch(setAuthError(error.message || 'Échec de la mise à jour du profil.'));
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  }, [displayName, dispatch, router]);

  return (
    <SafeAreaProvider className="flex-1 bg-background dark:bg-foreground">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background dark:bg-foreground">
        <ThemedView className="flex-1 items-center justify-center bg-background px-8 dark:bg-foreground">
          <ThemedText type="title" className="mb-4 font-poppinsBold text-foreground dark:text-foreground">
            Modifier le Profil
          </ThemedText>
          <ThemedView className="w-full items-center justify-center bg-background dark:bg-foreground">
            <ThemedText type="subtitle" className="mb-6 text-center font-poppinsSemiBold text-muted-foreground">
              Mettez à jour vos informations de profil.
            </ThemedText>
            <ThemedView className="m-4 flex w-full flex-col items-center justify-center rounded-lg py-8 shadow-lg dark:bg-gray-800">
              <Input
                placeholder="Nom d'affichage"
                className="mb-4 h-12 w-full items-center"
                value={displayName}
                onChangeText={setDisplayName}
                editable={!isLoading}
              />
              {/* Ajoutez d'autres champs pour d'autres attributs si nécessaire */}

              <Button
                label={isLoading ? <ActivityIndicator color="#fff" /> : "Enregistrer les modifications"}
                size={'default'}
                variant="secondary"
                onPress={handleUpdateProfile}
                className="mb-4 w-4/5 items-center justify-center font-poppinsSemiBold"
                disabled={isLoading}
              />

              <Button
                label="Annuler"
                size={'default'}
                variant="ghost"
                onPress={() => router.back()}
                className="w-4/5 items-center justify-center font-poppinsSemiBold mt-2"
                disabled={isLoading}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default EditProfileScreen;