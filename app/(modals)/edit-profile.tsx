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
import { setUser } from '../../store/slices/authSlice'; // Import setUser action

const EditProfileScreen = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  // Get user data and loading status from Redux state
  const user = useSelector((state: RootState) => state.auth); // Get the whole auth state for convenience
  const authLoading = useSelector((state: RootState) => state.auth.loading); // Use authLoading for Redux-managed loading

  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isLoading, setIsLoading] = useState(false); // Local loading for this component's specific action

  // Update the local displayName state when the Redux user displayName changes
  useEffect(() => {
    if (user.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user.displayName]);

  const handleUpdateProfile = useCallback(async () => {
    if (!auth.currentUser) {
      Alert.alert('Erreur', 'Aucun utilisateur connecté.');
      return;
    }

    setIsLoading(true); // Start local loading

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        // photoURL: "https://example.com/jane-q-user/profile.jpg" // Add if you manage profile photos
      });

      // Update Redux state with the new user information after successful Firebase update
      dispatch(setUser({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || null,
        displayName: auth.currentUser.displayName || null,
        role: user.role, // Keep existing role from Redux state
        projectRoles: user.projectRoles, // Keep existing projectRoles from Redux state
        isAuthenticated: user.isAuthenticated,
        loading: false, // Explicitly set loading to false here
        error: null, // Clear any error
      }));

      Alert.alert('Succès', 'Votre profil a été mis à jour.');
      router.back(); // Go back to the previous screen (Profile or Settings)
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil :', error.message);
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour du profil.');
    } finally {
      setIsLoading(false); // End local loading
    }
  }, [displayName, dispatch, router, user.role, user.projectRoles, user.isAuthenticated]); // Add all dependencies

  // Combine local isLoading with Redux authLoading for button disabled state
  const buttonDisabled = isLoading || authLoading;

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
                editable={!buttonDisabled} // Use combined disabled state
              />
              {/* Add other fields for other attributes if necessary */}

              <Button
                label={isLoading ? <ActivityIndicator color="#fff" /> : "Enregistrer les modifications"}
                size={'default'}
                variant="secondary"
                onPress={handleUpdateProfile}
                className="mb-4 w-4/5 items-center justify-center font-poppinsSemiBold"
                disabled={buttonDisabled} // Use combined disabled state
              />

              <Button
                label="Annuler"
                size={'default'}
                variant="ghost"
                onPress={() => router.back()}
                className="w-4/5 items-center justify-center font-poppinsSemiBold mt-2"
                disabled={buttonDisabled} // Use combined disabled state
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default EditProfileScreen;