import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)/register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(auth)/phone-login" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="worker" />
            <Stack.Screen name="contractor" />
            <Stack.Screen name="homeowner" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="user-profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="post-contract" options={{ presentation: 'modal' }} />
            <Stack.Screen name="post-job" options={{ presentation: 'modal' }} />
            <Stack.Screen name="search-results" options={{ animation: 'slide_from_right', headerTitle: 'Search Results' }} />
            <Stack.Screen name="view-applicants" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="view-bids" options={{ animation: 'slide_from_right' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
