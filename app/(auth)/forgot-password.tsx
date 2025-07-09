// app/auth/forgot-password.tsx
import React, { useState, useCallback } from 'react';
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
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = useCallback(async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'E-mail envoyé',
        'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception (et vos spams).'
      );
      router.push('/auth/login'); // Rediriger vers l'écran de connexion
    } catch (error: any) {
      console.error('Erreur de réinitialisation du mot de passe :', error.message);
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'L\'adresse e-mail est mal formatée.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun utilisateur trouvé avec cette adresse e-mail.';
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert('Erreur de réinitialisation', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, router]);

  return (
    <SafeAreaProvider className="flex-1 bg-background dark:bg-foreground">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background dark:bg-foreground">
        <ThemedView className="flex-1 items-center justify-center bg-background px-8 dark:bg-foreground">
          <ThemedText type="title" className="mb-4 font-poppinsBold text-foreground dark:text-foreground">
            Réinitialiser le mot de passe
          </ThemedText>
          <ThemedView className="w-full items-center justify-center bg-background dark:bg-foreground">
            <ThemedText type="subtitle" className="mb-6 text-center font-poppinsSemiBold text-muted-foreground">
              Entrez votre e-mail pour recevoir un lien de réinitialisation.
            </ThemedText>
            <ThemedView className="m-4 flex w-full flex-col items-center justify-center rounded-lg py-8 shadow-lg dark:bg-gray-800">
              <Input
                placeholder="Email"
                className="mb-6 h-12 w-full items-center"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <Button
                label={isLoading ? <ActivityIndicator color="#fff" /> : "Envoyer le lien de réinitialisation"}
                size={'default'}
                variant="secondary"
                onPress={handleResetPassword}
                className="mb-4 w-4/5 items-center justify-center font-poppinsSemiBold"
                disabled={isLoading}
              />

              <ThemedText
                onPress={() => router.push('/auth/login')}
                className="text-primary-foreground underline mt-4"
              >
                Retour à la connexion
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default ForgotPasswordScreen;