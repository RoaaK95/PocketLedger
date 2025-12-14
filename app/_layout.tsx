import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-get-random-values';
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { useNotificationObserver } from "../hooks/useNotificationObserver";
import { registerForPushNotifications } from "../utils/pushNotifications";

function RootNavigator() {
  const {user, loading} = useAuth();
  
  // Set up notification observer with userId
  useNotificationObserver(user?.uid || null);

  // Register for push notifications when user logs in
  useEffect(() => {
    if (user) {
      registerForPushNotifications().catch((error) => {
        console.error("Failed to register for push notifications:", error);
      });
    }
  }, [user]);
  
  if(loading) return null
  //apply splash screen later

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}

export default function Layout(){
  return(
    <AuthProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <RootNavigator />
    </AuthProvider>
  )
}