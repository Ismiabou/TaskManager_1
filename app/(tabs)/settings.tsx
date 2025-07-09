// app/(tabs)/settings.tsx
import { ThemedText } from './../../components/ThemedText';
import { ThemedView } from './../../components/ThemedView';
import { Button } from './../../components/Button';
import React, { useCallback, useState } from 'react'; // Import useState
import { ScrollView, Switch, Alert, Linking } from 'react-native'; // Import Linking for external links
import { useRouter } from 'expo-router';

import { useColorScheme } from './../../hooks/useColorScheme.web'; // Votre hook personnalisé pour le thème

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();

  // État local pour les préférences de notifications
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  const [receiveEmailSummaries, setReceiveEmailSummaries] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Français'); // État pour la langue

  const toggleTheme = useCallback(() => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setColorScheme]);

  const handleAboutPress = useCallback(() => {
    Alert.alert(
      "À Propos de l'application",
      'Version : 1.0.0\nDéveloppé avec Expo et Firebase.\n\n© 2024 Gestionnaire de tâches'
    );
  }, []);

  const handlePrivacyPolicyPress = useCallback(() => {
    // Dans une vraie application, vous navigueriez vers une page web ou un écran local.
    Alert.alert('Politique de Confidentialité', 'Afficher la politique de confidentialité.');
    // Exemple de navigation vers un lien externe:
    // Linking.openURL('https://votre-site.com/politique-confidentialite');
  }, []);

  const handleTermsOfServicePress = useCallback(() => {
    // Idem pour les conditions d'utilisation.
    Alert.alert("Conditions d'Utilisation", "Afficher les conditions d'utilisation.");
    // Linking.openURL('https://votre-site.com/conditions-utilisation');
  }, []);

  const handleChangePasswordPress = useCallback(() => {
    router.push('(auth)/forgot-password'); // Vous devrez créer cet écran
  }, [router]);

  const handleChangeEmailPress = useCallback(() => {
    Alert.alert("Changer l'e-mail", "Naviguer vers l'écran de changement d'e-mail.");
    // router.push('/auth/change-email'); // Vous devrez créer cet écran
  }, []);

  const handleManageProfilePress = useCallback(() => {
     router.push('/(modals)/edit-profile'); 
  }, [router]);

  return (
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
            trackColor={{ false: '#767577', true: '#81b0ff' }} // Couleurs pour le switch
            thumbColor={colorScheme === 'dark' ? '#f4f3f4' : '#f4f3f4'}
          />
        </ThemedView>

        {/* Section Notifications */}
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

        {/* Section Compte */}
        <ThemedText className="mb-3 border-b border-border pb-2 font-poppinsSemiBold text-xl text-foreground">
          Compte
        </ThemedText>
        <ThemedView className="mb-6 rounded-lg bg-card p-4 shadow-sm">
          <Button
            label="Gérer les détails du profil"
            variant="ghost"
            onPress={handleManageProfilePress}
            className="mb-1 w-full justify-start font-poppinsRegular"
          />
          <Button
            label="Changer le mot de passe"
            variant="ghost"
            onPress={handleChangePasswordPress}
            className="mb-1 w-full justify-start font-poppinsRegular"
          />
          <Button
            label="Changer l'adresse e-mail"
            variant="ghost"
            onPress={handleChangeEmailPress}
            className="w-full justify-start font-poppinsRegular"
          />
        </ThemedView>

        {/* Section Général */}
        <ThemedText className="mb-3 border-b border-border pb-2 font-poppinsSemiBold text-xl text-foreground">
          Général
        </ThemedText>
        <ThemedView className="mb-6 rounded-lg bg-card p-4 shadow-sm">
          <ThemedView className="mb-3 flex-row items-center justify-between">
            <ThemedText className="font-poppinsRegular text-lg text-foreground">
              Langue de l'application
            </ThemedText>
            <ThemedText className="text-lg text-muted-foreground">{selectedLanguage}</ThemedText>
            {/* Vous pouvez ajouter un Picker ou un bouton ici pour ouvrir un sélecteur de langue */}
          </ThemedView>
          <Button
            label="À Propos de l'application"
            variant="ghost"
            onPress={handleAboutPress}
            className="mb-1 w-full justify-start font-poppinsRegular"
          />
          <Button
            label="Politique de Confidentialité"
            variant="ghost"
            onPress={handlePrivacyPolicyPress}
            className="mb-1 w-full justify-start font-poppinsRegular"
          />
          <Button
            label="Conditions d'Utilisation"
            variant="ghost"
            onPress={handleTermsOfServicePress}
            className="w-full justify-start font-poppinsRegular"
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
