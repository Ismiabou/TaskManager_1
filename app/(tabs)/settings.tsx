// app/(tabs)/settings.tsx
import { ThemedText } from './../../components/ThemedText';
import { ThemedView } from './../../components/ThemedView';
import React, { useCallback, useState } from 'react';
import { ScrollView, Switch, Alert, Linking, TouchableOpacity, Button } from 'react-native'; 
import { useRouter } from 'expo-router';
import { clearAuth } from 'store/slices/authSlice'; 

import { useColorScheme } from './../../hooks/useColorScheme.web';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  const [receiveEmailSummaries, setReceiveEmailSummaries] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Français');

  const dispatch: AppDispatch = useDispatch();

  const toggleTheme = useCallback(() => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setColorScheme]);

  const handleLogoutPress = useCallback(() => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Oui',
        onPress: async () => {
          await dispatch(clearAuth());
        },
      },
    ]);
  }, [dispatch]);

  const handleAboutPress = useCallback(() => {
    Alert.alert(
      "À Propos de l'application",
      'Version : 1.0.0\nDéveloppé avec Expo et Firebase.\n\n© 2024 Gestionnaire de tâches'
    );
  }, []);

  const handlePrivacyPolicyPress = useCallback(() => {
    Alert.alert('Politique de Confidentialité', 'Afficher la politique de confidentialité.');
  }, []);

  const handleTermsOfServicePress = useCallback(() => {
    Alert.alert("Conditions d'Utilisation", "Afficher les conditions d'utilisation.");
  }, []);

  const handleChangePasswordPress = useCallback(() => {
    router.push('(auth)/forgot-password');
  }, [router]);

  const handleChangeEmailPress = useCallback(() => {
    Alert.alert("Changer l'e-mail", "Naviguer vers l'écran de changement d'e-mail.");
  }, []);

  const handleManageProfilePress = useCallback(() => {
    router.push('/(modals)/edit-profile');
  }, [router]);
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-foreground">
      <ThemedView className="flex-1 items-center justify-center bg-background p-4">
        <ThemedText className="mb-4 text-center font-poppinsSemiBold text-xl text-foreground">
          Vous devez être connecté pour accéder aux paramètres.
        </ThemedText>
        <Button
          title="Aller à la page de connexion"
          onPress={() => router.push('/(auth)/login')} // Assurez-vous que ce chemin est correct
        />
      </ThemedView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-foreground">
    <ThemedView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <ThemedText className="mb-6 font-poppinsBold text-2xl text-foreground">
          Paramètres
        </ThemedText>

        {/* Section Apparence */}
        <ThemedText className="mb-3 border-b border-border pb-2 font-poppinsSemiBold text-xl text-foreground">
          Apparence
        </ThemedText>
        <ThemedView className="mb-6 flex-row items-center justify-between rounded-lg bg-card p-4 shadow-sm">
          <ThemedText className="font-poppinsRegular text-lg text-foreground">
            Mode Sombre
          </ThemedText>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={colorScheme === 'dark' ? '#f4f3f4' : '#f4f3f4'}
          />
        </ThemedView>
        <ThemedText className="mb-3 border-b border-border pb-2 font-poppinsSemiBold text-xl text-foreground">
          Notifications
        </ThemedText>
        <ThemedView className="mb-6 rounded-lg bg-card p-4 shadow-sm">
          <ThemedView className="mb-3 flex-row items-center justify-between">
            <ThemedText className="font-poppinsRegular text-lg text-foreground">
              Notifications Push
            </ThemedText>
            <Switch
              value={enablePushNotifications}
              onValueChange={setEnablePushNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={enablePushNotifications ? '#f4f3f4' : '#f4f3f4'}
            />
          </ThemedView>
          <ThemedView className="flex-row items-center justify-between">
            <ThemedText className="font-poppinsRegular text-lg text-foreground">
              Résumé par E-mail
            </ThemedText>
            <Switch
              value={receiveEmailSummaries}
              onValueChange={setReceiveEmailSummaries}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={receiveEmailSummaries ? '#f4f3f4' : '#f4f3f4'}
            />
          </ThemedView>
        </ThemedView>
        <ThemedText className="mb-3 border-b border-border pb-2 font-poppinsSemiBold text-xl text-foreground">
          Compte
        </ThemedText>
        <ThemedView className="mb-6 rounded-lg bg-card p-4 shadow-sm">
          <TouchableOpacity
            onPress={handleManageProfilePress}
            className="mb-1 w-full justify-start h-8 font-poppinsRegular"
          >
            <ThemedText className='font-poppinsRegular text-xl text-foreground'>Gérer le profil</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChangePasswordPress}
            className="mb-1 w-full justify-start h-8 font-poppinsRegular text-xl text-foreground"
          >
            <ThemedText className='font-poppinsRegular text-xl text-foreground'>Changer le mot de passe</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChangeEmailPress}
            className="w-full justify-start h-8 font-poppinsRegular text-xl text-foreground"
          >
            <ThemedText className='font-poppinsRegular text-xl text-foreground'>Changer l'adresse e-mail</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogoutPress}
            className="mt-2 w-full justify-start h-8 font-poppinsRegular"
          >
            <ThemedText className='font-poppinsRegular text-xl text-red-500'>Se déconnecter</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedText className="mb-3 border-b border-border pb-2 font-poppinsSemiBold text-xl text-foreground">
          Général
        </ThemedText>
        <ThemedView className="mb-6 rounded-lg bg-card p-4 shadow-sm">
          <ThemedView className="mb-3 flex-row items-center h-8 justify-between">
            <ThemedText className="font-poppinsRegular text-lg h-8 text-foreground">
              Langue de l'application
            </ThemedText>
            <ThemedText className="text-lg text-muted-foreground">{selectedLanguage}</ThemedText>
          </ThemedView>
          <TouchableOpacity
            onPress={handleAboutPress}
            className="mb-1 w-full justify-start h-8 font-poppinsRegular"
          >
            <ThemedText className='font-poppinsRegular'>À Propos de l'application</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePrivacyPolicyPress}
            className="mb-1 w-full justify-start h-8 font-poppinsRegular"
          >
            <ThemedText className='font-poppinsRegular'>Politique de Confidentialité</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTermsOfServicePress}
            className="mb-1 w-full justify-start h-8 font-poppinsRegular"
          >
            <ThemedText className='font-poppinsRegular'>Conditions d'Utilisation</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}