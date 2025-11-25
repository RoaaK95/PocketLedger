import { Redirect, Stack } from 'expo-router';
import 'react-native-get-random-values';
import { AuthProvider, useAuth } from "../hooks/useAuth";

function RootNavigator() {
  const {user, loading} = useAuth();
  
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